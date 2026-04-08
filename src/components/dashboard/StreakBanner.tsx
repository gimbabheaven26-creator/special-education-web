'use client';

import Link from 'next/link';
import { Flame } from 'lucide-react';
import { useStudyStore } from '@/stores/useStudyStore';
import { getLevel, getLevelProgress, getLevelName } from '@/lib/study/xp-constants';
import { useMounted } from '@/hooks/useMounted';

export function StreakBanner() {
  const mounted = useMounted();
  const currentStreak = useStudyStore((s) => s.currentStreak);
  const totalXP = useStudyStore((s) => s.totalXP);

  if (!mounted) {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-4 sm:p-5 text-primary-foreground animate-pulse">
        <div className="h-16" />
      </div>
    );
  }

  const isNewUser = currentStreak === 0;

  return (
    <Link href="/record" className="block rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-4 sm:p-5 text-primary-foreground hover:from-primary/90 hover:to-primary/70 transition-colors break-keep">
      {isNewUser ? (
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Flame className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold">
              오늘 첫 학습을 시작해보세요!
            </h2>
            <p className="text-sm opacity-90 mt-0.5">
              매일 꾸준히 학습하면 스트릭이 쌓여요
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Flame className="h-6 w-6 sm:h-7 sm:w-7 text-streak" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold truncate">
                {currentStreak}일 연속 학습 중!
              </h2>
              <p className="text-sm opacity-90 mt-0.5">
                오늘도 화이팅!
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-sm sm:text-lg font-bold flex items-center gap-1 justify-end whitespace-nowrap">
              <span>{getLevelName(getLevel(totalXP)).emoji}</span>
              <span>{getLevelName(getLevel(totalXP)).name}</span>
            </div>
            <div className="text-xs opacity-80 mt-0.5 whitespace-nowrap">
              Lv.{getLevel(totalXP)} · {totalXP.toLocaleString()} XP
            </div>
            <div className="mt-1.5 h-1.5 w-20 sm:w-24 rounded-full bg-white/20 ml-auto">
              <div
                className="h-full rounded-full bg-white/80 transition-all"
                style={{ width: `${getLevelProgress(totalXP).percent}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </Link>
  );
}
