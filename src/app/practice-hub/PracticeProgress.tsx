'use client';

import Link from 'next/link';
import { useMounted } from '@/hooks/useMounted';
import { useQuizStore } from '@/stores/useQuizStore';
import { useStudyStore } from '@/stores/useStudyStore';
import { ArrowRight, BarChart3 } from 'lucide-react';

export function PracticeProgress() {
  const mounted = useMounted();

  const quizHistory = useQuizStore((s) => s.quizHistory);
  const recentActivities = useStudyStore((s) => s.recentActivities);
  const totalQuizzes = useStudyStore((s) => s.totalQuizzes);
  const totalCorrect = useStudyStore((s) => s.totalCorrect);

  if (!mounted) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-xl border p-4 space-y-2 animate-pulse">
              <div className="h-4 w-16 rounded bg-muted" />
              <div className="h-6 w-12 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const totalSolved = quizHistory.length;
  const totalRate = totalQuizzes > 0 ? Math.round((totalCorrect / totalQuizzes) * 100) : 0;
  const subjectsSet = new Set(recentActivities.map((a) => a.subjectSlug));
  const subjectsStarted = subjectsSet.size;

  // 최근 학습 활동 (가장 마지막)
  const lastActivity = recentActivities.length > 0
    ? recentActivities[recentActivities.length - 1]
    : null;

  if (totalSolved === 0 && subjectsStarted === 0) {
    return (
      <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-5 text-center">
        <p className="text-sm font-medium text-foreground mb-1">아직 학습 기록이 없어요</p>
        <p className="text-xs text-muted-foreground mb-3">
          개념학습부터 시작해보세요
        </p>
        <Link
          href="/concepts"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          개념학습 시작하기
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-muted-foreground">학습 현황</h2>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border p-3 text-center">
          <p className="text-lg font-bold text-foreground">{subjectsStarted}</p>
          <p className="text-[11px] text-muted-foreground">학습 과목</p>
        </div>
        <div className="rounded-xl border p-3 text-center">
          <p className="text-lg font-bold text-foreground">{totalSolved.toLocaleString()}</p>
          <p className="text-[11px] text-muted-foreground">총 풀이</p>
        </div>
        <div className="rounded-xl border p-3 text-center">
          <p className="text-lg font-bold text-foreground">{totalRate}%</p>
          <p className="text-[11px] text-muted-foreground">정답률</p>
        </div>
      </div>

      {/* 이어서 학습 */}
      {lastActivity && (
        <Link
          href={`/concepts/${encodeURIComponent(lastActivity.subjectSlug)}`}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors"
        >
          <span className="text-base" aria-hidden="true">&#x1F4D6;</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              이어서 학습: {lastActivity.subjectTitle}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {lastActivity.chapterTitle}
            </p>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        </Link>
      )}
    </div>
  );
}
