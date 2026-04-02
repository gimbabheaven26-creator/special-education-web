import type { StudyLevel, StudyPlan, WeeklyMilestone } from '@/stores/useOnboardingStore';
import examStructure from '@/data/exam-structure.json';

type SubjectWeight = {
  title: string;
  weight: number;
  category: string;
  priority: string;
  recommendedWeeks: number;
};

type LevelConfig = {
  label: string;
  dailyQuizTarget: number;
  dailyChapterTarget: number;
  strategy: string;
  subjectOrder: string[];
};

import { getKSTDate } from '@/lib/date-utils';

const subjectWeights = examStructure.subjectWeights as Record<string, SubjectWeight>;
const studyLevels = examStructure.studyLevels as Record<string, LevelConfig>;

function weeksUntil(targetDate: string): number {
  const today = new Date(getKSTDate() + 'T00:00:00+09:00');
  const target = new Date(targetDate + 'T00:00:00+09:00');
  const diffMs = target.getTime() - today.getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7)));
}

function distributeSubjectsAcrossWeeks(
  subjectOrder: string[],
  totalWeeks: number,
  weakSubjects: string[],
): WeeklyMilestone[] {
  const milestones: WeeklyMilestone[] = [];

  // Prioritize weak subjects by moving them earlier
  const prioritized = [...subjectOrder].sort((a, b) => {
    const aIsWeak = weakSubjects.includes(a) ? 0 : 1;
    const bIsWeak = weakSubjects.includes(b) ? 0 : 1;
    if (aIsWeak !== bIsWeak) return aIsWeak - bIsWeak;
    return subjectOrder.indexOf(a) - subjectOrder.indexOf(b);
  });

  // Assign subjects to weeks based on their recommended weeks
  let currentWeek = 1;

  for (const subjectSlug of prioritized) {
    const sw = subjectWeights[subjectSlug];
    if (!sw || currentWeek > totalWeeks) break;

    const weeksForSubject = Math.max(
      1,
      Math.min(sw.recommendedWeeks, Math.floor(totalWeeks / prioritized.length))
    );

    for (let w = 0; w < weeksForSubject && currentWeek <= totalWeeks; w++) {
      const existing = milestones.find((m) => m.weekNumber === currentWeek);
      if (existing) {
        milestones[milestones.indexOf(existing)] = {
          ...existing,
          subjects: [...existing.subjects, subjectSlug],
        };
      } else {
        milestones.push({
          weekNumber: currentWeek,
          subjects: [subjectSlug],
          quizTarget: 10,
          chapterTarget: 1,
          label: `${currentWeek}주차: ${sw.title}`,
        });
      }
      currentWeek++;
    }
  }

  // Fill remaining weeks with review cycles
  while (currentWeek <= totalWeeks) {
    const reviewSubjects = weakSubjects.length > 0
      ? weakSubjects
      : prioritized.slice(0, 3);

    milestones.push({
      weekNumber: currentWeek,
      subjects: reviewSubjects,
      quizTarget: 15,
      chapterTarget: 2,
      label: `${currentWeek}주차: 복습 + 오답 집중`,
    });
    currentWeek++;
  }

  return milestones;
}

export function generateStudyPlan(
  examDate: string,
  level: StudyLevel,
  weakSubjects: string[],
): StudyPlan {
  const levelConfig = studyLevels[level];
  const totalWeeks = weeksUntil(examDate);

  const weeklyMilestones = distributeSubjectsAcrossWeeks(
    levelConfig.subjectOrder,
    totalWeeks,
    weakSubjects,
  );

  return {
    createdAt: getKSTDate(),
    examDate,
    level,
    weakSubjects: [...weakSubjects],
    targetSubjects: [...weakSubjects],
    weeklyMilestones,
    dailyQuizTarget: levelConfig.dailyQuizTarget,
    dailyChapterTarget: levelConfig.dailyChapterTarget,
    dailyQuestionsTarget: 20,
  };
}

export function getCurrentWeekMilestone(plan: StudyPlan): WeeklyMilestone | null {
  const today = new Date(getKSTDate() + 'T00:00:00+09:00');
  const planStart = new Date(plan.createdAt + 'T00:00:00+09:00');
  const weeksSinceStart = Math.floor(
    (today.getTime() - planStart.getTime()) / (1000 * 60 * 60 * 24 * 7)
  ) + 1;

  return plan.weeklyMilestones.find((m) => m.weekNumber === weeksSinceStart) ?? null;
}

export function getEncouragementMessage(
  type: 'start' | 'progress' | 'complete' | 'missed',
  params: Record<string, string | number> = {},
): string {
  const messages = examStructure.encouragementMessages[type];
  const randomIndex = Math.floor(Math.random() * messages.length);
  let message = messages[randomIndex];

  for (const [key, value] of Object.entries(params)) {
    message = message.replace(`{${key}}`, String(value));
  }

  return message;
}

export function getSubjectTitle(slug: string): string {
  return subjectWeights[slug]?.title ?? slug;
}

export function getSubjectWeight(slug: string): number {
  return subjectWeights[slug]?.weight ?? 0;
}

export function getAllSubjectSlugs(): string[] {
  return Object.keys(subjectWeights);
}

/**
 * 다음 임용고시 1차 시험일을 자동 계산한다.
 * 임용고시 1차는 매년 11월 셋째 주 토요일에 실시.
 * 이미 지났으면 다음 해 시험일을 반환한다.
 */
export function getNextExamDate(): string {
  const todayStr = getKSTDate();
  const today = new Date(todayStr + 'T00:00:00+09:00');
  const year = parseInt(todayStr.slice(0, 4), 10);

  function thirdSaturdayOfNovember(y: number): Date {
    // UTC noon으로 요일 계산 — 서버 타임존(UTC/KST)에 무관하게 동일 결과
    const nov1DayOfWeek = new Date(Date.UTC(y, 10, 1, 12)).getUTCDay(); // 0=Sun, 6=Sat
    const daysToFirstSat = (6 - nov1DayOfWeek + 7) % 7;
    const firstSat = daysToFirstSat === 0 ? 1 : 1 + daysToFirstSat;
    const thirdSatDay = firstSat + 14;
    return new Date(`${y}-11-${String(thirdSatDay).padStart(2, '0')}T00:00:00+09:00`);
  }

  const thisYearExam = thirdSaturdayOfNovember(year);

  // 오늘 기준으로 이번 해 시험이 아직 안 지났으면 이번 해, 지났으면 내년
  const examDate = today <= thisYearExam
    ? thisYearExam
    : thirdSaturdayOfNovember(year + 1);

  return getKSTDate(examDate);
}
