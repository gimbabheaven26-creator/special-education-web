// Study domain — stats, mastery, gamification, study planning
// Re-exports for barrel imports: `import { ... } from '@/lib/study'`

export {
  computeOverallAccuracy,
  computeSubjectStats,
  computeChapterStats,
  computeDailyVolume,
  identifyWeakAreas,
  computeTrend,
  computeWrongNoteSummary,
  computeWeeklySummary,
  computeWeeklyTrend,
  computeHeatmapData,
  computeStudyDays,
} from './stats-utils';
export type {
  SubjectStats,
  ChapterStats,
  DailyVolume,
  WrongNoteSummaryData,
  WeeklyStatsData,
  WeeklySummaryData,
  WeeklyTrendEntry,
  HeatmapDay,
} from './stats-utils';

export {
  getMasteryInfo,
  calculateChapterMasteries,
  calculateSubjectMasteries,
  simulatePass,
} from './mastery';
export type { MasteryLevel, MasteryInfo, ChapterMastery, SubjectMastery, PassSimulation } from './mastery';

export {
  generateStudyPlan,
  getCurrentWeekMilestone,
  getEncouragementMessage,
  getSubjectTitle,
  getSubjectWeight,
  getAllSubjectSlugs,
  getNextExamDate,
} from './study-planner';

export { BADGES, computeBadges } from './badges';
export type { Badge, BadgeStats } from './badges';

export {
  XP_PER_QUIZ,
  XP_PER_CORRECT,
  XP_PER_CHAPTER,
  XP_TOAST_CORRECT,
  XP_TOAST_WRONG,
  COMBO_THRESHOLDS,
  getComboBonus,
  XP_PER_LEVEL,
  LEVEL_NAMES,
  getLevel,
  getLevelProgress,
  getLevelName,
} from './xp-constants';

export { getPatternInfo, detectErrorPatterns } from './error-patterns';
export type { ErrorPattern, ErrorPatternInfo } from './error-patterns';

export {
  createSchedule,
  advanceSchedule,
  isDueToday,
  isGroupComplete,
  getNextScenarioId,
  daysUntilReview,
} from './spaced-scenario';

export { createScoreTiers, getScoreTier } from './score-tiers';
export type { ScoreTier } from './score-tiers';
