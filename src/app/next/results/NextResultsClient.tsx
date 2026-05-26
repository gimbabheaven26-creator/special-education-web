'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  FileText,
  ListChecks,
  Target,
} from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { useMounted } from '@/hooks/useMounted';
import {
  MOCK_EXAM_PREVIEW_TRENDS,
  buildMockExamPaperTrends,
  buildSewNextNextAction,
  getRecentSewNextSessions,
  type MockExamPaperTrend,
} from '@/lib/sew-next/results';
import { getChapterDisplayName, getSubjectDisplayName } from '@/lib/study/display-labels';
import { cn } from '@/lib/utils';
import { useQuizStore } from '@/stores/useQuizStore';

function sessionTone(mode: string): string {
  if (mode === 'mock') return 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200';
  if (mode === 'custom') return 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-200';
  if (mode === 'review') return 'border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900/60 dark:bg-violet-950/30 dark:text-violet-200';
  return 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200';
}

function MockExamPaperTrendSection({
  trends,
  preview = false,
}: {
  trends: readonly MockExamPaperTrend[];
  preview?: boolean;
}) {
  return (
    <section className="border-t border-border pt-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground">
            {preview ? 'Mock Exam 전공A/B 미리보기' : 'Mock Exam 전공A/B 추세'}
          </p>
          <h2 className="mt-1 text-xl font-bold text-foreground">
            {preview ? '첫 실전형 결과가 쌓일 자리' : '시험지별 누적 흐름'}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {preview
              ? '첫 모의고사를 풀면 실제 전공A/B 정답률, 배점, 약점 형식이 이 결과판에 표시됩니다.'
              : '압축형과 실전형 모의고사의 전공A/B 결과를 Next 안에서만 추적합니다.'}
          </p>
        </div>
        <Link
          href="/next/practice?mode=mock&variant=full"
          className="inline-flex min-h-[40px] shrink-0 items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted"
        >
          {preview ? '실전형 23문항 시작' : '실전형'}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {trends.map((row) => (
          <article key={row.label} className="rounded-lg border border-border bg-card p-4">
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
            {!preview && (
              <Link
                href={row.actionHref}
                className="mt-3 inline-flex min-h-[36px] items-center justify-center rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted"
              >
                {row.label} 약점 문항 이어풀기
              </Link>
            )}
          </article>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50 p-4 dark:border-sky-900/60 dark:bg-sky-950/30">
        <p className="text-xs font-semibold text-sky-700 dark:text-sky-300">
          {preview ? '데모 처방' : '교시별 약점 처방'}
        </p>
        <div className="mt-2 space-y-1">
          {trends.map((row) => (
            <p key={`${row.label}-prescription`} className="text-xs leading-relaxed text-foreground">
              {row.prescription}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

export function NextResultsClient() {
  const mounted = useMounted();
  const quizHistory = useQuizStore((state) => state.quizHistory);
  const recentSewNextSessions = useMemo(() => getRecentSewNextSessions(quizHistory), [quizHistory]);
  const latestSewNextSession = recentSewNextSessions[0] ?? null;
  const nextAction = useMemo(() => buildSewNextNextAction(recentSewNextSessions), [recentSewNextSessions]);
  const mockExamPaperTrends = useMemo(() => buildMockExamPaperTrends(quizHistory), [quizHistory]);
  const totalSewNextQuestions = recentSewNextSessions.reduce((sum, session) => sum + session.total, 0);
  const latestSessionSubject = latestSewNextSession
    ? getSubjectDisplayName(latestSewNextSession.subject)
    : null;
  const latestSessionChapter = latestSewNextSession
    ? getChapterDisplayName(latestSewNextSession.chapter)
    : null;

  if (!mounted) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-5 h-32 animate-pulse rounded-lg bg-muted" />
        <div className="mt-5 h-48 animate-pulse rounded-lg bg-muted" />
      </main>
    );
  }

  const hasResults = latestSewNextSession || mockExamPaperTrends.length > 0;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-6 lg:px-6">
        <header className="border-b border-border pb-5">
          <Link
            href="/next"
            className="inline-flex min-h-[36px] items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            SEW Next
          </Link>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold text-primary">결과 추적</p>
              <h1 className="mt-2 text-3xl font-bold">SEW Next Results</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Next에서 푼 세션과 전공A/B 모의고사 흐름을 Classic 기록과 분리해서 확인합니다.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm sm:min-w-[280px]">
              <div className="rounded-lg border border-border bg-card px-3 py-2">
                <p className="text-xs text-muted-foreground">최근 세션</p>
                <p className="mt-1 text-xl font-bold tabular-nums">{recentSewNextSessions.length}</p>
              </div>
              <div className="rounded-lg border border-border bg-card px-3 py-2">
                <p className="text-xs text-muted-foreground">추적 문항</p>
                <p className="mt-1 text-xl font-bold tabular-nums">{totalSewNextQuestions}</p>
              </div>
            </div>
          </div>
        </header>

        {!hasResults && (
          <div className="py-6">
            <EmptyState
              icon="📈"
              title="아직 SEW Next 결과가 없어요"
              description="실전형 23문항이나 처방 세션을 한 번 풀면 이곳에 최근 세션, 전공A/B 추세, 다음 학습 처방이 쌓입니다."
              action={{ label: '실전형 23문항 시작', href: '/next/practice?mode=mock&variant=full' }}
            />
          </div>
        )}

        <div className="space-y-7 py-6">
          {latestSewNextSession && (
            <section className="rounded-lg border border-sky-200 bg-sky-50 p-5 dark:border-sky-900/60 dark:bg-sky-950/30">
              <Link href={latestSewNextSession.href} className="block transition-opacity hover:opacity-80">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300">
                      <Target className="h-4 w-4" />
                      <p className="text-xs font-semibold">최근 SEW Next 세션</p>
                    </div>
                    <h2 className="mt-2 text-2xl font-bold text-foreground">{latestSewNextSession.title}</h2>
                    <p className="mt-1 flex flex-wrap items-center gap-x-1 text-sm text-muted-foreground">
                      <span>{latestSessionSubject}</span>
                      <span aria-hidden="true">·</span>
                      <span>{latestSessionChapter}</span>
                    </p>
                  </div>
                  <div className="rounded-lg bg-background/80 px-4 py-3 text-right">
                    <p className="text-lg font-bold tabular-nums text-sky-700 dark:text-sky-300">
                      {latestSewNextSession.total}문항 · {latestSewNextSession.rate}%
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {latestSewNextSession.correct}/{latestSewNextSession.total} 정답
                    </p>
                  </div>
                </div>
              </Link>

              {recentSewNextSessions.length > 1 && (
                <div className="mt-5 border-t border-sky-200 pt-4 dark:border-sky-900/60">
                  <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300">
                    <BarChart3 className="h-4 w-4" />
                    <p className="text-xs font-semibold">최근 3회 SEW Next 흐름</p>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {recentSewNextSessions.map((session, index) => (
                      <Link
                        key={`${session.mode}-${session.timestamp}`}
                        href={session.href}
                        className={cn(
                          'rounded-lg border px-3 py-3 transition-colors hover:bg-background',
                          sessionTone(session.mode),
                        )}
                      >
                        <p className="text-[10px] font-semibold">{index === 0 ? '최신' : `${index + 1}회 전`}</p>
                        <p className="mt-1 truncate text-sm font-bold text-foreground">{session.title}</p>
                        <p className="mt-1 text-lg font-bold tabular-nums">{session.rate}%</p>
                      </Link>
                    ))}
                  </div>
                  {nextAction && (
                    <Link
                      href={nextAction.href}
                      className="mt-3 flex min-h-[48px] items-center justify-between gap-3 rounded-lg border border-border bg-background/80 px-3 py-2 hover:bg-background"
                    >
                      <span>
                        <span className="block text-[10px] font-semibold text-sky-700 dark:text-sky-300">
                          다음 추천 학습
                        </span>
                        <span className="mt-1 block text-xs text-foreground">{nextAction.message}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </Link>
                  )}
                </div>
              )}
            </section>
          )}

          {mockExamPaperTrends.length > 0 ? (
            <MockExamPaperTrendSection trends={mockExamPaperTrends} />
          ) : (
            <MockExamPaperTrendSection trends={MOCK_EXAM_PREVIEW_TRENDS} preview />
          )}

          <section className="grid gap-3 border-t border-border pt-5 md:grid-cols-3">
            <Link
              href="/next/practice?mode=adaptive"
              className="rounded-lg border border-border bg-card p-4 hover:bg-muted/40"
            >
              <Target className="h-5 w-5 text-primary" />
              <p className="mt-3 text-sm font-bold">처방 세션</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">가장 낮은 준비도 영역부터 2문항으로 재점검합니다.</p>
            </Link>
            <Link
              href="/next/qbank"
              className="rounded-lg border border-border bg-card p-4 hover:bg-muted/40"
            >
              <ListChecks className="h-5 w-5 text-primary" />
              <p className="mt-3 text-sm font-bold">커스텀 Qbank</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">영역, 난도, 문항 형식으로 약점 세트를 다시 만듭니다.</p>
            </Link>
            <Link
              href="/next/practice?mode=mock&variant=full"
              className="rounded-lg border border-border bg-card p-4 hover:bg-muted/40"
            >
              <FileText className="h-5 w-5 text-primary" />
              <p className="mt-3 text-sm font-bold">Full Mock Exam</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">전공A/B 23문항 구조로 결과판을 갱신합니다.</p>
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
