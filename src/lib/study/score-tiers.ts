/**
 * 점수 기반 감성 피드백 티어 시스템
 *
 * 5곳에서 동일한 4단계(91+/61+/31+/0+) 패턴을 사용하므로 공유 모듈로 추출.
 * 각 사용처는 createScoreTiers(messages)로 메시지만 커스터마이즈.
 */

export interface ScoreTier {
  min: number;
  emoji: string;
  color: string;
  bg: string;
  message: string;
}

const TIER_STYLES = [
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
    min: 0,
    emoji: '📖',
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800',
  },
] as const;

/**
 * 4개 메시지를 받아 ScoreTier 배열을 생성한다.
 * 순서: [91+, 61+, 31+, 0+]
 */
export function createScoreTiers(
  messages: [string, string, string, string],
): ScoreTier[] {
  return TIER_STYLES.map((style, i) => ({ ...style, message: messages[i] }));
}

/**
 * 퍼센트 점수에 해당하는 티어를 반환한다.
 */
export function getScoreTier(pct: number, tiers: ScoreTier[]): ScoreTier {
  return tiers.find((t) => pct >= t.min) ?? tiers[tiers.length - 1];
}
