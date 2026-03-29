'use client';

import { useState } from 'react';
import type { DailyVolume } from '@/lib/study/stats-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StudyVolumeChartProps {
  readonly volume7: ReadonlyArray<DailyVolume>;
  readonly volume30: ReadonlyArray<DailyVolume>;
}

type Period = 7 | 30;

function formatDate(dateStr: string): string {
  const parts = dateStr.split('-');
  return `${parts[1]}/${parts[2]}`;
}

export default function StudyVolumeChart({ volume7, volume30 }: StudyVolumeChartProps) {
  const [period, setPeriod] = useState<Period>(7);
  const data = period === 7 ? volume7 : volume30;
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const BAR_MAX_HEIGHT = 120;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">학습량</CardTitle>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setPeriod(7)}
              className="focus:outline-none"
            >
              <Badge variant={period === 7 ? 'default' : 'outline'}>7일</Badge>
            </button>
            <button
              type="button"
              onClick={() => setPeriod(30)}
              className="focus:outline-none"
            >
              <Badge variant={period === 30 ? 'default' : 'outline'}>30일</Badge>
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.every((d) => d.count === 0) ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            아직 학습 기록이 없어요
          </p>
        ) : (
          <div className="overflow-x-auto">
            <div
              className="flex items-end gap-1 min-w-0"
              style={{ minWidth: period === 30 ? '500px' : undefined }}
            >
              {data.map((d) => {
                const totalHeight = Math.round((d.count / maxCount) * BAR_MAX_HEIGHT);
                const correctHeight = d.count > 0
                  ? Math.round((d.correct / d.count) * totalHeight)
                  : 0;
                const wrongHeight = totalHeight - correctHeight;

                return (
                  <div
                    key={d.date}
                    className="flex flex-col items-center flex-1"
                    style={{ minWidth: period === 30 ? '16px' : '28px' }}
                  >
                    {d.count > 0 && (
                      <span className="text-[10px] text-muted-foreground mb-1">
                        {d.count}
                      </span>
                    )}
                    <div
                      className="w-full flex flex-col justify-end rounded-t"
                      style={{ height: `${BAR_MAX_HEIGHT}px` }}
                    >
                      {d.count > 0 && (
                        <div className="w-full flex flex-col rounded-t overflow-hidden">
                          <div
                            className="w-full bg-blue-300 dark:bg-blue-700"
                            style={{ height: `${wrongHeight}px` }}
                          />
                          <div
                            className="w-full bg-blue-500 dark:bg-blue-400"
                            style={{ height: `${correctHeight}px` }}
                          />
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-muted-foreground mt-1 whitespace-nowrap">
                      {period === 7 ? formatDate(d.date) : ''}
                    </span>
                  </div>
                );
              })}
            </div>
            {period === 30 && (
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-muted-foreground">
                  {formatDate(data[0]?.date ?? '')}
                </span>
                <span className="text-[9px] text-muted-foreground">
                  {formatDate(data[data.length - 1]?.date ?? '')}
                </span>
              </div>
            )}
            <div className="flex items-center gap-3 mt-3 justify-center">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-blue-500 dark:bg-blue-400" />
                <span className="text-[10px] text-muted-foreground">정답</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-blue-300 dark:bg-blue-700" />
                <span className="text-[10px] text-muted-foreground">오답</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
