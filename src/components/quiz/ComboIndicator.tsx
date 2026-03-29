'use client';

import { getComboBonus } from '@/lib/study/xp-constants';
import { Flame } from 'lucide-react';

interface ComboIndicatorProps {
  streak: number;
}

export function ComboIndicator({ streak }: ComboIndicatorProps) {
  const combo = getComboBonus(streak);
  if (!combo) return null;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold animate-in zoom-in-50 duration-300 ${combo.color} bg-current/10`}
      style={{ backgroundColor: 'color-mix(in srgb, currentColor 10%, transparent)' }}
    >
      <Flame className="h-3.5 w-3.5" />
      {streak}연속 {combo.label} +{combo.bonus}XP
    </div>
  );
}
