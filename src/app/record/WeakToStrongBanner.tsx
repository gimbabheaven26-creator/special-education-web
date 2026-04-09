'use client';

import { Award } from 'lucide-react';
import type { WeakToStrongEntry } from '@/lib/study/stats-utils';

interface WeakToStrongBannerProps {
  readonly weakToStrong: readonly WeakToStrongEntry[];
}

export function WeakToStrongBanner({ weakToStrong }: WeakToStrongBannerProps) {
  if (weakToStrong.length === 0) return null;

  const top = weakToStrong[0];

  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/30">
      <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
      <p className="text-sm text-emerald-800 dark:text-emerald-200">
        <span className="font-semibold">{top.subject}</span> 정답률이{' '}
        <span className="tabular-nums">{top.previousRate}%</span> →{' '}
        <span className="font-bold tabular-nums">{top.currentRate}%</span>로 올랐어요!
      </p>
    </div>
  );
}
