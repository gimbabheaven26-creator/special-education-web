export const XP_PER_QUIZ = 10;
export const XP_PER_CORRECT = 5;
export const XP_PER_CHAPTER = 20;

/** Toast display: XP earned on correct answer (XP_PER_QUIZ + XP_PER_CORRECT) */
export const XP_TOAST_CORRECT = XP_PER_QUIZ + XP_PER_CORRECT;
/** Toast display: XP earned on wrong answer (XP_PER_QUIZ only) */
export const XP_TOAST_WRONG = XP_PER_QUIZ;

// ─── Combo System ──────────────────────────────────────────────────────────

export const COMBO_THRESHOLDS = [
  { streak: 3, bonus: 5, label: '콤보!', color: 'text-emerald-500' },
  { streak: 5, bonus: 10, label: '대단해!', color: 'text-amber-500' },
  { streak: 7, bonus: 15, label: '불꽃!', color: 'text-orange-500' },
  { streak: 10, bonus: 20, label: '전설!', color: 'text-red-500' },
] as const;

/** Get combo bonus for a given streak count */
export function getComboBonus(streak: number): { bonus: number; label: string; color: string } | null {
  for (let i = COMBO_THRESHOLDS.length - 1; i >= 0; i--) {
    if (streak >= COMBO_THRESHOLDS[i].streak) {
      return COMBO_THRESHOLDS[i];
    }
  }
  return null;
}

// ─── Level System ──────────────────────────────────────────────────────────

export const XP_PER_LEVEL = 100;

export const LEVEL_NAMES: ReadonlyArray<{ minLevel: number; name: string; emoji: string }> = [
  { minLevel: 0, name: '예비 수험생', emoji: '🌱' },
  { minLevel: 3, name: '수습 교사', emoji: '📖' },
  { minLevel: 6, name: '열정 수험생', emoji: '🔥' },
  { minLevel: 10, name: '합격 유망주', emoji: '⭐' },
  { minLevel: 15, name: '실력파 교사', emoji: '💪' },
  { minLevel: 20, name: '임용 마스터', emoji: '👑' },
  { minLevel: 30, name: '특수교육 전문가', emoji: '🎓' },
];

export function getLevel(totalXP: number): number {
  return Math.floor(totalXP / XP_PER_LEVEL);
}

export function getLevelProgress(totalXP: number): { current: number; next: number; percent: number } {
  const current = totalXP % XP_PER_LEVEL;
  return { current, next: XP_PER_LEVEL, percent: Math.round((current / XP_PER_LEVEL) * 100) };
}

export function getLevelName(level: number): { name: string; emoji: string } {
  let result = LEVEL_NAMES[0];
  for (const entry of LEVEL_NAMES) {
    if (level >= entry.minLevel) {
      result = entry;
    }
  }
  return { name: result.name, emoji: result.emoji };
}
