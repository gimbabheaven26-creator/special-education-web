'use client';

import { Flame } from 'lucide-react';
import { useStudyStore } from '@/stores/useStudyStore';
import { useEffect, useState } from 'react';

export function StreakBanner() {
  const [mounted, setMounted] = useState(false);
  const currentStreak = useStudyStore((s) => s.currentStreak);
  const totalXP = useStudyStore((s) => s.totalXP);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-4 sm:p-5 text-primary-foreground animate-pulse">
        <div className="h-16" />
      </div>
    );
  }

  const isNewUser = currentStreak === 0;

  return (
    <div className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-4 sm:p-5 text-primary-foreground">
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Flame className="h-6 w-6 sm:h-7 sm:w-7 text-streak" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {currentStreak}일 연속 학습 중!
              </h2>
              <p className="text-sm opacity-90 mt-0.5">
                오늘도 화이팅!
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{totalXP.toLocaleString()}</div>
            <div className="text-xs opacity-80">총 XP</div>
          </div>
        </div>
      )}
    </div>
  );
}
