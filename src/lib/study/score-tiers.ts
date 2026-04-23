export interface ScoreTier {
  min: number;
  emoji: string;
  color: string;
  bg: string;
  message: string;
}

const TIER_STYLES = [
  {
    min: 100,
    emoji: '🎉',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
  },
  {
    min: 91,
    emoji: '🏆',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
  },
  {
    min: 61,
    emoji: '💪',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
  },
  {
    min: 31,
    emoji: '🌱',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
  },
  {
    min: 1,
    emoji: '📖',
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800',
  },
  {
    min: 0,
    emoji: '🤗',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800',
  },
] as const;

/**
 * 4개 메시지(기본) 또는 6개 메시지(극단 포함)를 받아 ScoreTier 배열 생성.
 * 4개: [91+, 61+, 31+, 0+] — 기존 호환
 * 6개: [100%, 91+, 61+, 31+, 1+, 0%] — 극단 감성 분기
 */
export function createScoreTiers(
  messages: [string, string, string, string] | [string, string, string, string, string, string],
): ScoreTier[] {
  if (messages.length === 6) {
    return TIER_STYLES.map((style, i) => ({ ...style, message: messages[i] }));
  }
  return TIER_STYLES
    .filter((s) => s.min !== 100 && s.min !== 0)
    .map((style, i) => ({
      ...style,
      min: i === 3 ? 0 : style.min,
      message: messages[i],
    }));
}

export function getScoreTier(pct: number, tiers: ScoreTier[]): ScoreTier {
  return tiers.find((t) => pct >= t.min) ?? tiers[tiers.length - 1];
}
