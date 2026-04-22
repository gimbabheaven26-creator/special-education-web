'use client';

import Link from 'next/link';
import { TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';
import type { SubjectWeeklySummaryEntry } from '@/lib/study/stats-utils';

function barColor(rate: number): string {
  if (rate >= 80) return 'bg-emerald-500';
  if (rate >= 60) return 'bg-amber-500';
  if (rate >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

interface SubjectGrowthCardProps {
  readonly entries: readonly SubjectWeeklySummaryEntry[];
}

export function SubjectGrowthCard({ entries }: SubjectGrowthCardProps) {
  const visible = entries.slice(0, 5);

  if (visible.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-semibold text-muted-foreground mb-2">이번 주 과목별 변화</p>
        <p className="text-xs text-muted-foreground text-center py-3">
          이번 주 첫 학습을 시작하면 과목별 변화를 볼 수 있어요
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <p className="text-xs font-semibold text-muted-foreground">이번 주 과목별 변화</p>

      <div className="space-y-2.5">
        {visible.map((entry) => {
          const DeltaIcon = entry.delta > 0 ? TrendingUp : entry.delta < 0 ? TrendingDown : Minus;
          const deltaColor = entry.delta > 0 ? 'text-green-500' : entry.delta < 0 ? 'text-red-500' : 'text-muted-foreground';
          const deltaText = entry.delta > 0 ? `+${entry.delta}%p` : entry.delta < 0 ? `${entry.delta}%p` : '±0';

          return (
            <div key={entry.subject} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium truncate max-w-[120px]">{entry.subject}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold tabular-nums">{entry.thisWeek.rate}%</span>
                  <div className={`flex items-center gap-0.5 ${deltaColor}`}>
                    <DeltaIcon className="h-3 w-3" />
                    <span className="text-[10px] font-medium tabular-nums">{deltaText}</span>
                  </div>
                </div>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor(entry.thisWeek.rate)}`}
                  style={{ width: `${Math.max(entry.thisWeek.rate, 2)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <Link
        href="/mastery"
        className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors pt-1"
        aria-label="상세 통계 페이지로 이동"
      >
        상세 통계
        <ChevronRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
