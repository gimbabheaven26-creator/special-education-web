'use client';

import { useMemo } from 'react';
import { Award } from 'lucide-react';
import { useStudyStore } from '@/stores/useStudyStore';
import { useQuizStore } from '@/stores/useQuizStore';
import { computeBadges } from '@/lib/badges';

export function BadgeDisplay() {
  const { currentStreak, totalQuizzes, totalXP } = useStudyStore();
  const wrongNotes = useQuizStore((s) => s.wrongNotes);

  const masteredWrongNotes = useMemo(
    () => wrongNotes.filter((n) => n.mastered).length,
    [wrongNotes],
  );

  const badges = useMemo(
    () => computeBadges({ totalQuizzes, currentStreak, masteredWrongNotes, totalXP }),
    [totalQuizzes, currentStreak, masteredWrongNotes, totalXP],
  );

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">배지</span>
        </div>
        <span className="text-xs text-muted-foreground">{earnedCount}/{badges.length} 획득</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {badges.map(({ badge, earned }) => (
          <div
            key={badge.id}
            className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border text-center transition-opacity ${
              earned
                ? 'border-primary/30 bg-primary/5'
                : 'border-border bg-muted/30 opacity-40'
            }`}
          >
            <span className="text-2xl leading-none">{badge.emoji}</span>
            <span className={`text-xs font-medium leading-tight ${earned ? 'text-foreground' : 'text-muted-foreground'}`}>
              {badge.name}
            </span>
            <span className="text-[10px] text-muted-foreground leading-tight">{badge.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
