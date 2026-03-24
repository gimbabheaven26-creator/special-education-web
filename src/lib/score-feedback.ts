/**
 * 점수 구간별 감성 피드백 시스템
 *
 * 4단계 구간: 0~30 / 31~60 / 61~90 / 91~100
 * 각 구간마다 격려 메시지 + 색상 클래스를 반환한다.
 */

export interface ScoreFeedback {
  readonly emoji: string;
  readonly message: string;
  readonly colorClass: string;
  readonly bgClass: string;
  readonly tier: 'struggling' | 'developing' | 'proficient' | 'mastery';
}

const FEEDBACK_TIERS: readonly ScoreFeedback[] = [
  {
    emoji: '💪',
    message: '시작이 반이에요! 틀린 문제를 다시 보면 금방 늘어요.',
    colorClass: 'text-red-600 dark:text-red-400',
    bgClass: 'bg-red-50 dark:bg-red-950/30',
    tier: 'struggling',
  },
  {
    emoji: '🌱',
    message: '성장하고 있어요! 꾸준히 하면 분명 달라질 거에요.',
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-50 dark:bg-amber-950/30',
    tier: 'developing',
  },
  {
    emoji: '🎯',
    message: '잘 하고 있어요! 합격이 눈앞이에요.',
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/30',
    tier: 'proficient',
  },
  {
    emoji: '🏆',
    message: '완벽에 가까워요! 이 실력이면 자신감을 가져도 돼요.',
    colorClass: 'text-purple-600 dark:text-purple-400',
    bgClass: 'bg-purple-50 dark:bg-purple-950/30',
    tier: 'mastery',
  },
] as const;

/**
 * 점수(0~100%)에 맞는 감성 피드백을 반환한다.
 *
 * 냉장고 온도계 비유: 0~30은 냉동실(아직 차갑다), 31~60은 냉장실(서서히 오르는 중),
 * 61~90은 실온(편안한 영역), 91~100은 따뜻한 햇살(최고 상태).
 */
export function getScoreFeedback(percentage: number): ScoreFeedback {
  if (percentage >= 91) return FEEDBACK_TIERS[3];
  if (percentage >= 61) return FEEDBACK_TIERS[2];
  if (percentage >= 31) return FEEDBACK_TIERS[1];
  return FEEDBACK_TIERS[0];
}

/**
 * 점수에 따른 프로그레스 링 색상 클래스 (stroke 기반)
 */
export function getScoreStrokeClass(percentage: number): string {
  if (percentage >= 91) return 'stroke-purple-500';
  if (percentage >= 61) return 'stroke-emerald-500';
  if (percentage >= 31) return 'stroke-amber-500';
  return 'stroke-red-500';
}

/**
 * 점수에 따른 프로그레스 바 배경색 클래스
 */
export function getScoreBarClass(percentage: number): string {
  if (percentage >= 91) return 'bg-purple-500';
  if (percentage >= 61) return 'bg-green-500';
  if (percentage >= 31) return 'bg-amber-500';
  return 'bg-red-500';
}
