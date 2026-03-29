'use client';

import { getLevel, getLevelName, getLevelProgress, LEVEL_NAMES } from '@/lib/study/xp-constants';

interface LevelProgressProps {
  readonly totalXP: number;
}

export default function LevelProgress({ totalXP }: LevelProgressProps) {
  const level = getLevel(totalXP);
  const { name, emoji } = getLevelName(level);
  const { current, next, percent } = getLevelProgress(totalXP);

  // Find the next level name
  const nextLevelEntry = LEVEL_NAMES.find((entry) => entry.minLevel > level);
  const nextLevelName = nextLevelEntry
    ? `${nextLevelEntry.emoji} ${nextLevelEntry.name}`
    : null;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          <div>
            <p className="text-sm font-semibold text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground">Lv.{level}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {current} / {next} XP
        </p>
      </div>

      <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      {nextLevelName && (
        <p className="text-xs text-muted-foreground text-right">
          다음: {nextLevelName}
        </p>
      )}
    </div>
  );
}
