'use client';

import { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { useQuizStore } from '@/stores/useQuizStore';
import { useStudyStore } from '@/stores/useStudyStore';

export function PracticeProgress() {
  const [mounted, setMounted] = useState(false);

  const quizHistory = useQuizStore((s) => s.quizHistory);
  const recentActivities = useStudyStore((s) => s.recentActivities);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalSolved = quizHistory.length;
  const subjectsStarted = new Set(
    recentActivities.map((a) => a.subjectSlug),
  ).size;

  if (!mounted) {
    return (
      <section aria-label="학습 현황">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">학습 현황</h2>
        </div>
        <div className="rounded-xl border border-border p-5 space-y-3 animate-pulse">
          <div className="h-4 w-48 rounded bg-muted" />
          <div className="h-4 w-36 rounded bg-muted" />
        </div>
      </section>
    );
  }

  return (
    <section aria-label="학습 현황">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">학습 현황</h2>
      </div>
      <div className="rounded-xl border border-border p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">개념학습 진도:</span>
          {subjectsStarted > 0
            ? `${subjectsStarted}개 과목 학습 중`
            : '아직 시작하지 않았어요'}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">문제풀기:</span>
          {totalSolved > 0
            ? `총 ${totalSolved.toLocaleString()}문제 풀이`
            : '아직 풀이 기록이 없어요'}
        </div>
      </div>
    </section>
  );
}
