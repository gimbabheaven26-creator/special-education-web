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

const subjectWeights = examStructure.subjectWeights as Record<string, SubjectWeight>;
const studyLevels = examStructure.studyLevels as Record<string, LevelConfig>;

function getKSTDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(date);
}

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
    weeklyMilestones,
    dailyQuizTarget: levelConfig.dailyQuizTarget,
    dailyChapterTarget: levelConfig.dailyChapterTarget,
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
