'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { WeeklySummaryData } from '@/lib/study/stats-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WeeklySummaryProps {
  readonly summary: WeeklySummaryData;
}

function DeltaBadge({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous;
  if (diff === 0 || (current === 0 && previous === 0)) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" />
      </span>
    );
  }

  const isPositive = diff > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        isPositive
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-red-600 dark:text-red-400'
      }`}
    >
      {isPositive ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {isPositive ? '+' : ''}
      {diff}
    </span>
  );
}

function RateDeltaBadge({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous;
  if (diff === 0 || (current === 0 && previous === 0)) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" />
      </span>
    );
  }

  const isPositive = diff > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        isPositive
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-red-600 dark:text-red-400'
      }`}
    >
      {isPositive ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {isPositive ? '+' : ''}
      {diff}%p
    </span>
  );
}

export default function WeeklySummary({ summary }: WeeklySummaryProps) {
  const { thisWeek, lastWeek } = summary;

  if (thisWeek.count === 0 && lastWeek.count === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">주간 요약</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          {/* 풀이 수 */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">풀이 수</p>
            <p className="text-xl font-bold">{thisWeek.count}</p>
            <DeltaBadge current={thisWeek.count} previous={lastWeek.count} />
          </div>

          {/* 정답률 */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">정답률</p>
            <p className="text-xl font-bold">{thisWeek.rate}%</p>
            <RateDeltaBadge current={thisWeek.rate} previous={lastWeek.rate} />
          </div>

          {/* XP */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">XP</p>
            <p className="text-xl font-bold">{thisWeek.xp}</p>
            <DeltaBadge current={thisWeek.xp} previous={lastWeek.xp} />
          </div>
        </div>

        {lastWeek.count > 0 && (
          <p className="text-xs text-muted-foreground text-center mt-3">
            지난 주: {lastWeek.count}문제, {lastWeek.rate}%, {lastWeek.xp} XP
          </p>
        )}
      </CardContent>
    </Card>
  );
}
