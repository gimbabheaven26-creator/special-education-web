'use client';

import type { WeeklyTrendEntry } from '@/lib/study/stats-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WeeklyTrendChartProps {
  readonly data: ReadonlyArray<WeeklyTrendEntry>;
}

function rateColor(rate: number): string {
  if (rate >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (rate >= 60) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

export default function WeeklyTrendChart({ data }: WeeklyTrendChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const BAR_MAX_HEIGHT = 100;

  const hasData = data.some((d) => d.count > 0);

  if (!hasData) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">주간 학습 추이</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2" role="img" aria-label={`최근 ${data.length}주 학습 추이 차트: ${data.filter((d) => d.count > 0).length}주 활동`}>
          {data.map((week) => {
            const totalHeight = Math.round((week.count / maxCount) * BAR_MAX_HEIGHT);
            const correctHeight = week.count > 0
              ? Math.round((week.correct / week.count) * totalHeight)
              : 0;
            const wrongHeight = totalHeight - correctHeight;

            return (
              <div key={week.weekLabel} className="flex flex-col items-center flex-1" aria-label={week.count > 0 ? `${week.weekLabel}주: ${week.count}문제, 정답률 ${week.rate}%` : `${week.weekLabel}주: 활동 없음`}>
                {week.count > 0 && (
                  <span className={`text-[10px] font-medium mb-0.5 ${rateColor(week.rate)}`}>
                    {week.rate}%
                  </span>
                )}
                <div
                  className="w-full flex flex-col justify-end"
                  style={{ height: `${BAR_MAX_HEIGHT}px` }}
                >
                  {week.count > 0 && (
                    <div className="w-full flex flex-col rounded-t overflow-hidden">
                      <div
                        className="w-full bg-violet-300 dark:bg-violet-700"
                        style={{ height: `${wrongHeight}px` }}
                      />
                      <div
                        className="w-full bg-violet-500 dark:bg-violet-400"
                        style={{ height: `${correctHeight}px` }}
                      />
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-muted-foreground mt-1 whitespace-nowrap">
                  {week.weekLabel}
                </span>
                {week.count > 0 && (
                  <span className="text-[9px] text-muted-foreground">
                    {week.count}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-3 mt-3 justify-center">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-violet-500 dark:bg-violet-400" />
            <span className="text-[10px] text-muted-foreground">정답</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-violet-300 dark:bg-violet-700" />
            <span className="text-[10px] text-muted-foreground">오답</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
