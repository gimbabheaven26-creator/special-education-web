export interface Badge {
  id: string;
  emoji: string;
  name: string;
  description: string;
  check: (stats: BadgeStats) => boolean;
}

export interface BadgeStats {
  totalQuizzes: number;
  currentStreak: number;
  masteredWrongNotes: number;
  totalXP: number;
}

export const BADGES: ReadonlyArray<Badge> = [
  {
    id: 'first-answer',
    emoji: '🌟',
    name: '첫 걸음',
    description: '첫 문제를 풀었어요',
    check: ({ totalQuizzes }) => totalQuizzes >= 1,
  },
  {
    id: 'quiz-10',
    emoji: '📚',
    name: '입문자',
    description: '10문제를 풀었어요',
    check: ({ totalQuizzes }) => totalQuizzes >= 10,
  },
  {
    id: 'quiz-100',
    emoji: '💯',
    name: '성실한 학생',
    description: '100문제를 풀었어요',
    check: ({ totalQuizzes }) => totalQuizzes >= 100,
  },
  {
    id: 'quiz-500',
    emoji: '🏆',
    name: '수험생',
    description: '500문제를 풀었어요',
    check: ({ totalQuizzes }) => totalQuizzes >= 500,
  },
  {
    id: 'quiz-1000',
    emoji: '👑',
    name: '임용 마스터',
    description: '1000문제를 풀었어요',
    check: ({ totalQuizzes }) => totalQuizzes >= 1000,
  },
  {
    id: 'streak-3',
    emoji: '🔥',
    name: '3일 연속',
    description: '3일 연속 학습했어요',
    check: ({ currentStreak }) => currentStreak >= 3,
  },
  {
    id: 'streak-7',
    emoji: '🔥🔥',
    name: '7일 연속',
    description: '7일 연속 학습했어요',
    check: ({ currentStreak }) => currentStreak >= 7,
  },
  {
    id: 'streak-30',
    emoji: '⚡',
    name: '30일 연속',
    description: '한 달 매일 공부했어요',
    check: ({ currentStreak }) => currentStreak >= 30,
  },
  {
    id: 'wrong-conquered',
    emoji: '✅',
    name: '오답 극복자',
    description: '오답 5개를 마스터했어요',
    check: ({ masteredWrongNotes }) => masteredWrongNotes >= 5,
  },
];

export function computeBadges(stats: BadgeStats): Array<{ badge: Badge; earned: boolean }> {
  return BADGES.map((badge) => ({ badge, earned: badge.check(stats) }));
}
