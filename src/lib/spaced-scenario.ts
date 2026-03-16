/**
 * Spaced Scenario Scheduling Engine
 *
 * Same principle practiced in different contexts with spaced repetition.
 * Intervals: 1 → 3 → 7 → 14 days. Reset to 1 on failure.
 */

import type { SpacedScenarioSchedule, ScenarioGroup } from '@/types/scenario';

const INTERVALS = [1, 3, 7, 14] as const;

function getKSTDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(date);
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T00:00:00+09:00');
  date.setDate(date.getDate() + days);
  return getKSTDate(date);
}

/**
 * Create initial schedule for a scenario group.
 */
export function createSchedule(groupId: string): SpacedScenarioSchedule {
  return {
    groupId,
    currentIndex: 0,
    nextReviewDate: getKSTDate(),
    intervalDays: INTERVALS[0],
    completedScenarioIds: [],
  };
}

/**
 * Advance schedule after completing a scenario.
 * On success (score >= 60%): move to next scenario + next interval.
 * On failure: reset interval to 1 day, stay at same scenario.
 */
export function advanceSchedule(
  schedule: SpacedScenarioSchedule,
  group: ScenarioGroup,
  scenarioId: string,
  score: number,
): SpacedScenarioSchedule {
  const today = getKSTDate();
  const passed = score >= 0.6;

  if (passed) {
    const nextIndex = Math.min(schedule.currentIndex + 1, group.scenarioIds.length - 1);
    const currentIntervalIdx = INTERVALS.indexOf(schedule.intervalDays as (typeof INTERVALS)[number]);
    const nextIntervalIdx = Math.min(
      currentIntervalIdx >= 0 ? currentIntervalIdx + 1 : 1,
      INTERVALS.length - 1,
    );
    const nextInterval = INTERVALS[nextIntervalIdx];

    const alreadyCompleted = schedule.completedScenarioIds.includes(scenarioId);

    return {
      groupId: schedule.groupId,
      currentIndex: nextIndex,
      nextReviewDate: addDays(today, nextInterval),
      intervalDays: nextInterval,
      completedScenarioIds: alreadyCompleted
        ? schedule.completedScenarioIds
        : [...schedule.completedScenarioIds, scenarioId],
    };
  }

  // Failed: reset interval, stay at same scenario
  return {
    ...schedule,
    nextReviewDate: addDays(today, INTERVALS[0]),
    intervalDays: INTERVALS[0],
  };
}

/**
 * Check if a group has a scenario due for review today.
 */
export function isDueToday(schedule: SpacedScenarioSchedule): boolean {
  const today = getKSTDate();
  return schedule.nextReviewDate <= today;
}

/**
 * Check if a group is fully completed (all scenarios done).
 */
export function isGroupComplete(
  schedule: SpacedScenarioSchedule,
  group: ScenarioGroup,
): boolean {
  return schedule.completedScenarioIds.length >= group.scenarioIds.length;
}

/**
 * Get the next scenario ID to practice in a group.
 */
export function getNextScenarioId(
  schedule: SpacedScenarioSchedule,
  group: ScenarioGroup,
): string | null {
  if (schedule.currentIndex >= group.scenarioIds.length) return null;
  return group.scenarioIds[schedule.currentIndex];
}

/**
 * Calculate days until next review.
 */
export function daysUntilReview(schedule: SpacedScenarioSchedule): number {
  const today = getKSTDate();
  const todayMs = new Date(today + 'T00:00:00+09:00').getTime();
  const reviewMs = new Date(schedule.nextReviewDate + 'T00:00:00+09:00').getTime();
  return Math.max(0, Math.ceil((reviewMs - todayMs) / 86400000));
}
