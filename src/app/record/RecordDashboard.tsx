'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Flame,
  Star,
  BookOpen,
  AlertCircle,
  ChevronRight,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
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
import { SubjectGrowthCard } from './SubjectGrowthCard';
import { WeakToStrongBanner } from './WeakToStrongBanner';
import { useMounted } from '@/hooks/useMounted';
import { EmptyState } from '@/components/ui/EmptyState';
import { getChapterDisplayName, getSubjectDisplayName } from '@/lib/study/display-labels';
import { buildTodayGrowthSummary } from '@/lib/study/today-growth-summary';
import type { QuizResult } from '@/types/quiz';

interface SewNextSessionSummary {
  title: string;
  mode: string;
  href: string;
  total: number;
  correct: number;
  rate: number;
  subject: string;
  chapter: string;
  timestamp: number;
}

interface SewNextNextAction {
  href: string;
  message: string;
}

interface SewNextRouteInfo {
  title: string;
  mode: string;
  href: string;
}

interface MockExamPaperTrend {
  label: string;
  period: string;
  total: number;
  correct: number;
  rate: number;
  possiblePoints: number;
  earnedPoints: number;
  fullCount: number;
}

const SEW_NEXT_SESSION_WINDOW_MS = 30 * 60 * 1000;

function getSewNextRouteInfo(sessionId: string): SewNextRouteInfo {
  const mode = sessionId.replace(/^sew-next-/, '');
  if (mode === 'adaptive') {
    return { title: 'Adaptive Readiness', mode, href: '/next/practice?mode=adaptive' };
  }
  if (mode === 'custom') {
    return { title: 'Custom Qbank', mode, href: '/next/practice?mode=custom' };
  }
  if (mode === 'mock') {
    return { title: 'Mock Exam', mode, href: '/next/practice?mode=mock' };
  }
  if (mode === 'mock-full') {
    return { title: 'Full Mock Exam', mode: 'mock', href: '/next/practice?mode=mock&variant=full' };
  }
  if (mode === 'review') {
    return { title: 'Spaced Review', mode, href: '/next/practice?mode=review' };
  }
  return { title: 'SEW Next', mode: mode || 'adaptive', href: '/next/practice?mode=adaptive' };
}

function getRecentSewNextSessions(quizHistory: readonly QuizResult[]): SewNextSessionSummary[] {
  const ordered = [...quizHistory]
    .filter((result) => result.sessionId?.startsWith('sew-next-'))
    .sort((a, b) => a.timestamp - b.timestamp);
  const grouped: QuizResult[][] = [];

  for (const result of ordered) {
    const currentGroup = grouped[grouped.length - 1];
    const previous = currentGroup?.[currentGroup.length - 1];
    const belongsToCurrentGroup = previous?.sessionId === result.sessionId
      && result.timestamp - previous.timestamp <= SEW_NEXT_SESSION_WINDOW_MS;

    if (belongsToCurrentGroup) {
      currentGroup.push(result);
    } else {
      grouped.push([result]);
    }
  }

  return grouped
    .map((sessionResults) => {
      const latest = sessionResults[sessionResults.length - 1];
      const correct = sessionResults.filter((result) => result.isCorrect).length;
      const route = getSewNextRouteInfo(latest.sessionId ?? '');

      return {
        title: route.title,
        mode: route.mode,
        href: route.href,
        total: sessionResults.length,
        correct,
        rate: Math.round((correct / sessionResults.length) * 100),
        subject: latest.subject,
        chapter: latest.chapter,
        timestamp: latest.timestamp,
      };
    })
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 3);
}

function buildMockExamPaperTrends(quizHistory: readonly QuizResult[]): MockExamPaperTrend[] {
  const rows = new Map<string, Omit<MockExamPaperTrend, 'rate'>>();

  for (const result of quizHistory) {
    if (!result.sessionId?.startsWith('sew-next-mock') || !result.sewNextExamMeta) continue;

    const meta = result.sewNextExamMeta;
    const current = rows.get(meta.paperLabel) ?? {
      label: meta.paperLabel,
      period: meta.period,
      total: 0,
      correct: 0,
      possiblePoints: 0,
      earnedPoints: 0,
      fullCount: 0,
    };

    rows.set(meta.paperLabel, {
      ...current,
      total: current.total + 1,
      correct: current.correct + (result.isCorrect ? 1 : 0),
      possiblePoints: current.possiblePoints + meta.points,
      earnedPoints: current.earnedPoints + (result.isCorrect ? meta.points : 0),
      fullCount: current.fullCount + (meta.mockVariant === 'full' ? 1 : 0),
    });
  }

  return Array.from(rows.values())
    .map((row) => ({
      ...row,
      rate: row.total > 0 ? Math.round((row.correct / row.total) * 100) : 0,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'ko'));
}

function buildSewNextNextAction(sessions: readonly SewNextSessionSummary[]): SewNextNextAction | null {
  if (sessions.length < 2) return null;

  const weakest = [...sessions].sort((a, b) => a.rate - b.rate || b.timestamp - a.timestamp)[0];
  if (!weakest) return null;

  const subject = getSubjectDisplayName(weakest.subject);
  const chapter = getChapterDisplayName(weakest.chapter);
  return {
    href: weakest.href,
    message: `${subject} ${chapter}을 2문항만 더 풀어 보세요.`,
  };
}

export default function RecordDashboard() {
  const mounted = useMounted();
  const { level, weakness, unmasteredCount, recommendations, currentStreak, subjectWeekly, weakToStrong } = useMyPageData();
  const totalXP = useStudyStore((s) => s.totalXP);
  const totalQuizzes = useStudyStore((s) => s.totalQuizzes);
  const dailyProgress = useStudyStore((s) => s.dailyProgress);
  const dailyGoal = useStudyStore((s) => s.dailyGoal);
  const wrongNotesCount = useQuizStore((s) => s.wrongNotes.length);
  const quizHistory = useQuizStore((s) => s.quizHistory);
  const bookmarkCount = useBookmarkStore((s) => s.bookmarks.length);
  const leitnerStats = useLeitnerStore(useShallow((s) => s.getStats()));
  const recentSewNextSessions = useMemo(() => getRecentSewNextSessions(quizHistory), [quizHistory]);
  const latestSewNextSession = recentSewNextSessions[0] ?? null;
  const sewNextNextAction = useMemo(() => buildSewNextNextAction(recentSewNextSessions), [recentSewNextSessions]);
  const mockExamPaperTrends = useMemo(() => buildMockExamPaperTrends(quizHistory), [quizHistory]);

  if (!mounted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        <div className="h-24 bg-muted animate-pulse rounded-2xl" />
        <div className="h-48 bg-muted animate-pulse rounded-2xl" />
      </div>
    );
  }

  const todayGrowth = buildTodayGrowthSummary(dailyProgress, dailyGoal, currentStreak);

  if (totalQuizzes === 0 && wrongNotesCount === 0 && quizHistory.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-foreground mb-6">내 기록</h1>
        <EmptyState
          icon="📊"
          title="아직 학습 기록이 없어요"
          description="퀴즈 한 세트만 풀어도 오늘의 성과와 약점 과목이 바로 보여요. 매일 조금씩 쌓이는 기록이 합격의 근거가 됩니다."
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

      {todayGrowth && (
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-primary">
                <CheckCircle2 className="h-4 w-4" />
                <p className="text-xs font-semibold">{todayGrowth.title}</p>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-primary tabular-nums">{todayGrowth.metric}</span>
                {todayGrowth.streakLabel && (
                  <span className="text-xs text-muted-foreground">{todayGrowth.streakLabel}</span>
                )}
              </div>
            </div>
          </div>
          <div>
            <div className="h-2 rounded-full bg-background overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${todayGrowth.progressPercent}%` }}
              />
            </div>
            <p className="text-sm text-foreground mt-2">{todayGrowth.message}</p>
            <p className="text-xs text-muted-foreground mt-1">{todayGrowth.detail}</p>
          </div>
        </div>
      )}

      {latestSewNextSession && (
        <section className="rounded-2xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-900/60 dark:bg-sky-950/30">
          <Link
            href={latestSewNextSession.href}
            className="block transition-opacity hover:opacity-80"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300">
                  <Target className="h-4 w-4" />
                  <p className="text-xs font-semibold">최근 SEW Next 세션</p>
                </div>
                <p className="mt-1 text-base font-bold text-foreground">{latestSewNextSession.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {latestSewNextSession.subject} · {latestSewNextSession.chapter}
                </p>
              </div>
              <div className="rounded-lg bg-background/80 px-3 py-2 text-right">
                <p className="text-sm font-bold tabular-nums text-sky-700 dark:text-sky-300">
                  {latestSewNextSession.total}문항 · {latestSewNextSession.rate}%
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {latestSewNextSession.correct}/{latestSewNextSession.total} 정답
                </p>
              </div>
            </div>
          </Link>

          {recentSewNextSessions.length > 1 && (
            <div className="mt-4 border-t border-sky-200 pt-3 dark:border-sky-900/60">
              <p className="text-xs font-semibold text-sky-700 dark:text-sky-300">최근 3회 SEW Next 흐름</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {recentSewNextSessions.map((session, index) => (
                  <Link
                    key={`${session.mode}-${session.timestamp}`}
                    href={session.href}
                    className="rounded-lg bg-background/80 px-2 py-2 text-center transition-colors hover:bg-background"
                  >
                    <p className="text-[10px] text-muted-foreground">{index === 0 ? '최신' : `${index + 1}회 전`}</p>
                    <p className="mt-1 truncate text-[11px] font-semibold text-foreground">{session.title}</p>
                    <p className="mt-1 text-sm font-bold tabular-nums text-sky-700 dark:text-sky-300">{session.rate}%</p>
                  </Link>
                ))}
              </div>
              {sewNextNextAction && (
                <Link
                  href={sewNextNextAction.href}
                  className="mt-3 block rounded-lg bg-background/80 px-3 py-2 transition-colors hover:bg-background"
                >
                  <p className="text-[10px] font-semibold text-sky-700 dark:text-sky-300">다음 추천 학습</p>
                  <p className="mt-1 text-xs text-foreground">{sewNextNextAction.message}</p>
                </Link>
              )}
            </div>
          )}
        </section>
      )}

      {mockExamPaperTrends.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Mock Exam 전공A/B 추세</p>
              <p className="mt-1 text-sm text-foreground">압축형과 실전형 모의고사의 시험지별 누적 결과입니다.</p>
            </div>
            <Link
              href="/next/practice?mode=mock&variant=full"
              className="shrink-0 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted"
            >
              실전형
            </Link>
          </div>
          <div className="mt-3 grid gap-2">
            {mockExamPaperTrends.map((row) => (
              <div key={row.label} className="rounded-xl bg-muted/40 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{row.label} · {row.period}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {row.total}문항 중 {row.correct}문항 정답 · {row.rate}%
                    </p>
                  </div>
                  <p className="text-sm font-bold tabular-nums text-primary">
                    {row.earnedPoints}/{row.possiblePoints}점
                  </p>
                </div>
                {row.fullCount > 0 && (
                  <p className="mt-2 text-[11px] font-semibold text-sky-700 dark:text-sky-300">
                    실전형 {row.fullCount}문항 포함
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
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

      <WeakToStrongBanner weakToStrong={weakToStrong} />
      <SubjectGrowthCard entries={subjectWeekly} />

      <FlashcardReviewStats />

      {weakness.overall.total > 0 && (
        <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card">
          <div>
            <p className="text-xs text-muted-foreground">전체 정답률</p>
            <p className="text-2xl font-bold tabular-nums">{Math.round(weakness.overall.rate)}%</p>
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
                  <span className="text-sm font-medium">{getSubjectDisplayName(area.subject)}</span>
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
