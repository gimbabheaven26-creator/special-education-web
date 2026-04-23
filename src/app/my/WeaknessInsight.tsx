'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { useMounted } from '@/hooks/useMounted';
import { useQuizStore } from '@/stores/useQuizStore';
import {
  computeSubjectStats,
  computeOverallAccuracy,
  computeTrend,
} from '@/lib/study/stats-utils';

const TREND_LABELS: Record<string, string> = {
  improving: '향상 중',
  declining: '하락 중',
  stable: '유지 중',
};

function rateColor(rate: number): string {
  if (rate < 40) return 'text-red-500';
  if (rate < 60) return 'text-amber-500';
  return 'text-green-500';
}

export function WeaknessInsight() {
  const mounted = useMounted();
  const quizHistory = useQuizStore((s) => s.quizHistory);
  const wrongNotes = useQuizStore((s) => s.wrongNotes);

  const data = useMemo(() => {
    const subjectStats = computeSubjectStats(quizHistory);
    const overall = computeOverallAccuracy(quizHistory);
    const trend = quizHistory.length >= 10 ? computeTrend(quizHistory) : null;
    const weakSubjects = subjectStats.filter((s) => s.rate < 60).slice(0, 3);

    // Wrong note count by subject
    const wrongBySubject = new Map<string, number>();
    for (const n of wrongNotes) {
      wrongBySubject.set(n.subject, (wrongBySubject.get(n.subject) ?? 0) + 1);
    }

    return { subjectStats, overall, trend, weakSubjects, wrongBySubject };
  }, [quizHistory, wrongNotes]);

  if (!mounted) {
    return <div className="h-32 rounded-xl border border-border bg-card animate-pulse" />;
  }

  if (data.overall.total < 10) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">약점 분석</h3>
        <EmptyState
          icon="📊"
          title="아직 분석할 데이터가 부족해요"
          description="10문제 이상 풀면 어떤 과목이 약한지, 어디부터 공략해야 하는지 알려드려요."
          action={{ label: '퀴즈 풀러 가기', href: '/quiz/ox', ariaLabel: '퀴즈 페이지로 이동' }}
        />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">약점 분석</h3>
        <p className="text-xs text-muted-foreground">
          전체 정답률 <span className={rateColor(data.overall.rate)}>{data.overall.rate}%</span>
          {data.trend && ` · ${TREND_LABELS[data.trend]}`}
        </p>
      </div>

      {data.weakSubjects.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">
          모든 과목 정답률이 60% 이상이에요. 잘하고 있어요!
        </p>
      ) : (
        <div className="space-y-2">
          {data.weakSubjects.map((s) => {
            const wrongCount = data.wrongBySubject.get(s.subject) ?? 0;
            return (
              <Link
                key={s.subject}
                href={`/quiz/${s.subject}`}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors -mx-1"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">{s.subject}</span>
                    <span className={`text-xs font-semibold ${rateColor(s.rate)}`}>{s.rate}%</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {s.total}문제 중 {s.correct}개 정답
                    {wrongCount > 0 && ` · 오답 ${wrongCount}개`}
                  </p>
                </div>
                <span className="text-xs text-primary shrink-0">연습하기</span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
