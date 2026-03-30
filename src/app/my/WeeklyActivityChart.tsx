'use client';

import { useMemo } from 'react';
import { useMounted } from '@/hooks/useMounted';
import { useQuizStore } from '@/stores/useQuizStore';
import { computeDailyVolume } from '@/lib/study/stats-utils';

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];
const BAR_MAX_HEIGHT = 56;

export function WeeklyActivityChart() {
  const mounted = useMounted();
  const quizHistory = useQuizStore((s) => s.quizHistory);

  const days = useMemo(() => computeDailyVolume(quizHistory, 7), [quizHistory]);
  const totalCount = days.reduce((sum, d) => sum + d.count, 0);
  const maxCount = Math.max(...days.map((d) => d.count), 1);
  const today = new Date();

  if (!mounted) {
    return <div className="h-28 rounded-xl border border-border bg-card animate-pulse" />;
  }

  // Map days to Mon-Sun order (computeDailyVolume returns last 7 days chronologically)
  // We need to align with DAY_LABELS by checking which day of week each entry is
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-foreground">이번 주 학습</p>
        <p className="text-xs text-muted-foreground">{totalCount}문제</p>
      </div>

      {totalCount === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">
          이번 주 첫 학습을 시작해보세요!
        </p>
      ) : (
        <div className="flex items-end justify-between gap-1.5">
          {days.map((day, i) => {
            const barH = day.count > 0 ? Math.max(4, Math.round((day.count / maxCount) * BAR_MAX_HEIGHT)) : 0;
            const correctH = day.correct > 0 && day.count > 0
              ? Math.max(2, Math.round((day.correct / day.count) * barH))
              : 0;
            // Calculate day of week for this bar
            const daysAgo = 6 - i;
            const dayOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysAgo).getDay();
            const dayLabel = DAY_LABELS[dayOfWeek === 0 ? 6 : dayOfWeek - 1];
            const isToday = daysAgo === 0;

            return (
              <div key={day.date} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className="relative w-full max-w-[28px] rounded-t-sm overflow-hidden bg-muted/50"
                  style={{ height: `${BAR_MAX_HEIGHT}px` }}
                >
                  {barH > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 flex flex-col">
                      <div
                        className="bg-primary/30 w-full"
                        style={{ height: `${barH - correctH}px` }}
                      />
                      <div
                        className="bg-primary w-full"
                        style={{ height: `${correctH}px` }}
                      />
                    </div>
                  )}
                </div>
                <span className={`text-[10px] ${isToday ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                  {dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
