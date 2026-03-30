'use client';

import Link from 'next/link';
import { useMounted } from '@/hooks/useMounted';
import { useStudyStore } from '@/stores/useStudyStore';
import { getLevel, getLevelProgress, getLevelName, LEVEL_NAMES } from '@/lib/study/xp-constants';

export function LevelBadge() {
  const mounted = useMounted();
  const totalXP = useStudyStore((s) => s.totalXP);
  const currentStreak = useStudyStore((s) => s.currentStreak);

  if (!mounted) {
    return <div className="h-20 rounded-xl border border-border bg-card animate-pulse" />;
  }

  const lv = getLevel(totalXP);
  const { name, emoji } = getLevelName(lv);
  const { current, next, percent } = getLevelProgress(totalXP);
  const nextEntry = LEVEL_NAMES.find((e) => e.minLevel > lv);

  return (
    <Link href="/mastery" className="block rounded-xl border border-border bg-card p-4 hover:bg-muted/30 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{emoji}</span>
          <div>
            <p className="text-sm font-semibold text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground">Lv.{lv} · {currentStreak > 0 ? `${currentStreak}일 연속` : '오늘 시작해보세요'}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground tabular-nums">{current}/{next} XP</p>
      </div>
      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      {nextEntry && (
        <p className="text-[11px] text-muted-foreground mt-1.5 text-right">
          다음: {nextEntry.emoji} {nextEntry.name}
        </p>
      )}
    </Link>
  );
}
