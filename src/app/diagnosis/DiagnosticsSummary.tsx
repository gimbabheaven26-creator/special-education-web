'use client';

import Link from 'next/link';
import { useMounted } from '@/hooks/useMounted';
import { useQuizStore } from '@/stores/useQuizStore';
import { useStudyStore } from '@/stores/useStudyStore';
import { TrendingUp, Target, ArrowRight } from 'lucide-react';

export function DiagnosticsSummary() {
  const mounted = useMounted();
  const sessions = useQuizStore((s) => s.diagnosticSessions);
  const totalQuizzes = useStudyStore((s) => s.totalQuizzes);
  const totalCorrect = useStudyStore((s) => s.totalCorrect);

  if (!mounted) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-xl border p-4 space-y-2 animate-pulse">
            <div className="h-4 w-16 rounded bg-muted" />
            <div className="h-6 w-12 rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  const totalRate = totalQuizzes > 0 ? Math.round((totalCorrect / totalQuizzes) * 100) : 0;
  const recentSessions = sessions
    .slice()
    .sort((a, b) => b.completedAt - a.completedAt)
    .slice(0, 3);
  const recentRate = recentSessions.length > 0
    ? Math.round(recentSessions.reduce((sum, s) => sum + s.stats.rate, 0) / recentSessions.length)
    : 0;

  if (totalQuizzes === 0) {
    return (
      <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-5 text-center">
        <p className="text-sm font-medium text-foreground mb-1">아직 진단 기록이 없어요</p>
        <p className="text-xs text-muted-foreground mb-3">
          OX 퀴즈로 빠르게 실력을 확인해보세요
        </p>
        <Link
          href="/quiz/ox"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          첫 진단 시작하기
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border p-4">
        <div className="flex items-center gap-2 mb-1">
          <Target className="h-4 w-4 text-blue-500" />
          <span className="text-xs text-muted-foreground">총 풀이</span>
        </div>
        <p className="text-xl font-bold text-foreground">{totalQuizzes.toLocaleString()}문제</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">누적 정답률 {totalRate}%</p>
      </div>
      <div className="rounded-xl border p-4">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          <span className="text-xs text-muted-foreground">최근 3회</span>
        </div>
        <p className="text-xl font-bold text-foreground">{recentRate}%</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {sessions.length}회 진단 완료
        </p>
      </div>
    </div>
  );
}
