'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Trend = 'improving' | 'declining' | 'stable';

interface StreakHistoryProps {
  readonly currentStreak: number;
  readonly longestStreak: number;
  readonly totalXP: number;
  readonly trend: Trend;
  readonly totalStudyDays: number;
}

const TREND_LABELS: Record<Trend, { icon: string; text: string; className: string }> = {
  improving: {
    icon: '\u{1F4C8}',
    text: '향상 중',
    className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  declining: {
    icon: '\u{1F4C9}',
    text: '하락 중',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  },
  stable: {
    icon: '\u27A1\uFE0F',
    text: '유지',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300',
  },
};

function computeLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export default function StreakHistory({
  currentStreak,
  longestStreak,
  totalXP,
  trend,
  totalStudyDays,
}: StreakHistoryProps) {
  const level = computeLevel(totalXP);
  const trendInfo = TREND_LABELS[trend];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">학습 기록</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{currentStreak}</p>
            <p className="text-xs text-muted-foreground">연속 학습일</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{longestStreak}</p>
            <p className="text-xs text-muted-foreground">최장 연속 기록</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{totalXP.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">총 XP (Lv.{level})</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{totalStudyDays}</p>
            <p className="text-xs text-muted-foreground">총 학습일</p>
          </div>
        </div>
        <div className="mt-4 flex justify-center">
          <Badge className={trendInfo.className}>
            {trendInfo.icon} {trendInfo.text}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
