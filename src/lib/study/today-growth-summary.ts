interface TodayGrowthProgress {
  quizzesCompleted: number;
  quizzesCorrect: number;
  chaptersCompleted?: number;
  flashcardsReviewed?: number;
}

interface TodayGrowthGoal {
  quizzes: number;
  chapters: number;
}

export interface TodayGrowthSummary {
  title: string;
  metric: string;
  message: string;
  detail: string;
  streakLabel: string | null;
  progressPercent: number;
}

function buildDetail(progress: TodayGrowthProgress): string {
  const details: string[] = [];
  const chaptersCompleted = progress.chaptersCompleted ?? 0;
  const flashcardsReviewed = progress.flashcardsReviewed ?? 0;

  if (chaptersCompleted > 0) {
    details.push(`개념 ${chaptersCompleted}개`);
  }

  if (flashcardsReviewed > 0) {
    details.push(`플래시카드 ${flashcardsReviewed}장`);
  }

  return details.length > 0 ? details.join(' · ') : '오늘 학습 기록이 쌓이고 있어요';
}

export function buildTodayGrowthSummary(
  progress: TodayGrowthProgress,
  goal: TodayGrowthGoal,
  currentStreak: number
): TodayGrowthSummary | null {
  const quizzesCompleted = progress.quizzesCompleted ?? 0;
  const quizzesCorrect = progress.quizzesCorrect ?? 0;
  const chaptersCompleted = progress.chaptersCompleted ?? 0;
  const flashcardsReviewed = progress.flashcardsReviewed ?? 0;
  const hasActivity = quizzesCompleted > 0 || chaptersCompleted > 0 || flashcardsReviewed > 0;

  if (!hasActivity) {
    return null;
  }

  const accuracy = quizzesCompleted > 0
    ? Math.round((quizzesCorrect / quizzesCompleted) * 100)
    : null;
  const metric = accuracy !== null
    ? `${quizzesCompleted}문제 · ${accuracy}%`
    : `복습 ${flashcardsReviewed}장`;
  const remainingQuizzes = Math.max(goal.quizzes - quizzesCompleted, 0);
  const message = remainingQuizzes === 0
    ? '오늘 목표를 채웠어요. 이 리듬 그대로 이어가면 됩니다.'
    : `목표까지 ${remainingQuizzes}문제 남았어요. 짧게 한 세트만 더 이어가도 좋아요.`;
  const progressPercent = goal.quizzes > 0
    ? Math.min(100, Math.round((quizzesCompleted / goal.quizzes) * 100))
    : 100;

  return {
    title: '오늘의 성장',
    metric,
    message,
    detail: buildDetail(progress),
    streakLabel: currentStreak > 0 ? `${currentStreak}일 연속` : null,
    progressPercent,
  };
}
