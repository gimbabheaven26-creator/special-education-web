'use client';

import type { HeatmapDay } from '@/lib/stats-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DailyHeatmapProps {
  readonly days: ReadonlyArray<HeatmapDay>;
  readonly maxCount: number;
  readonly totalWeeks: number;
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function intensityClass(count: number, max: number): string {
  if (count === 0) return 'bg-muted';
  const ratio = count / max;
  if (ratio <= 0.25) return 'bg-emerald-200 dark:bg-emerald-900';
  if (ratio <= 0.5) return 'bg-emerald-400 dark:bg-emerald-700';
  if (ratio <= 0.75) return 'bg-emerald-500 dark:bg-emerald-500';
  return 'bg-emerald-600 dark:bg-emerald-400';
}

export default function DailyHeatmap({ days, maxCount, totalWeeks }: DailyHeatmapProps) {
  const hasData = days.some((d) => d.count > 0);
  if (!hasData) return null;

  // Organize into grid: rows = days of week (0-6), columns = weeks
  const grid: (HeatmapDay | null)[][] = Array.from({ length: 7 }, () =>
    Array.from({ length: totalWeeks }, () => null),
  );

  for (const day of days) {
    if (day.dayOfWeek >= 0 && day.dayOfWeek < 7 && day.weekIndex >= 0 && day.weekIndex < totalWeeks) {
      grid[day.dayOfWeek][day.weekIndex] = day;
    }
  }

  const CELL_SIZE = 14;
  const GAP = 2;

  // Month labels from the data
  const monthLabels: { label: string; weekIndex: number }[] = [];
  let lastMonth = '';
  for (const day of days) {
    const month = day.date.slice(5, 7);
    if (month !== lastMonth && day.dayOfWeek === 0) {
      const monthNum = parseInt(month, 10);
      monthLabels.push({ label: `${monthNum}월`, weekIndex: day.weekIndex });
      lastMonth = month;
    }
  }

  const totalDays = days.reduce((sum, d) => sum + (d.count > 0 ? 1 : 0), 0);
  const totalCount = days.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">학습 활동</CardTitle>
          <span className="text-xs text-muted-foreground">
            {totalDays}일 / {totalCount}문제
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto" role="img" aria-label={`최근 ${totalWeeks}주 학습 활동 히트맵: ${totalDays}일 활동, 총 ${totalCount}문제 풀이`}>
          <div className="inline-block">
            {/* Month labels */}
            <div className="flex ml-7" style={{ gap: `${GAP}px` }}>
              {Array.from({ length: totalWeeks }, (_, wi) => {
                const label = monthLabels.find((m) => m.weekIndex === wi);
                return (
                  <div
                    key={wi}
                    style={{ width: `${CELL_SIZE}px` }}
                    className="text-[9px] text-muted-foreground text-center"
                  >
                    {label?.label ?? ''}
                  </div>
                );
              })}
            </div>

            {/* Grid */}
            <div className="flex flex-col" style={{ gap: `${GAP}px` }}>
              {[0, 1, 2, 3, 4, 5, 6].map((dow) => (
                <div key={dow} className="flex items-center" style={{ gap: `${GAP}px` }}>
                  <span
                    className="text-[9px] text-muted-foreground w-6 text-right pr-1 flex-shrink-0"
                  >
                    {dow % 2 === 1 ? DAY_LABELS[dow] : ''}
                  </span>
                  {grid[dow].map((cell, wi) => (
                    <div
                      key={wi}
                      className={`rounded-sm ${cell ? intensityClass(cell.count, maxCount) : 'bg-muted'}`}
                      style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px` }}
                      title={cell ? `${cell.date}: ${cell.count}문제` : ''}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1 mt-3 justify-end">
          <span className="text-[9px] text-muted-foreground mr-1">적음</span>
          <div className="w-3 h-3 rounded-sm bg-muted" />
          <div className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-900" />
          <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-700" />
          <div className="w-3 h-3 rounded-sm bg-emerald-500 dark:bg-emerald-500" />
          <div className="w-3 h-3 rounded-sm bg-emerald-600 dark:bg-emerald-400" />
          <span className="text-[9px] text-muted-foreground ml-1">많음</span>
        </div>
      </CardContent>
    </Card>
  );
}
