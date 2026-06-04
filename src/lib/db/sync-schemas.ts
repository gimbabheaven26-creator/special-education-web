import { z } from 'zod';

const dailyProgressSchema = z.object({
  date: z.string(),
  chaptersCompleted: z.number(),
  quizzesCompleted: z.number(),
  quizzesCorrect: z.number(),
  flashcardsReviewed: z.number(),
}).passthrough();

const recentActivitySchema = z.object({
  subjectSlug: z.string(),
  subjectTitle: z.string(),
  chapterSlug: z.string(),
  chapterTitle: z.string(),
  timestamp: z.number(),
}).passthrough();

const dailyHistoryEntrySchema = z.object({
  date: z.string(),
  questionsAttempted: z.number(),
  questionsCorrect: z.number(),
  xpEarned: z.number(),
  studyTimeMinutes: z.number().optional(),
  flashcardsReviewed: z.number().optional(),
}).passthrough();

const scenarioProgressSchema = z.object({
  scenarioId: z.string(),
  visitedNodeIds: z.array(z.string()),
  optimalCount: z.number(),
  totalChoices: z.number(),
  xpEarned: z.number(),
  completedAt: z.number().nullable(),
  startedAt: z.number(),
}).passthrough();

const spacedScenarioScheduleSchema = z.object({
  groupId: z.string(),
  currentIndex: z.number(),
  nextReviewDate: z.string(),
  intervalDays: z.number(),
  completedScenarioIds: z.array(z.string()),
}).passthrough();

export const studyStoreSchema = z.object({
  currentStreak: z.number(),
  longestStreak: z.number(),
  lastActiveDate: z.string().nullable(),
  dailyProgress: dailyProgressSchema,
  dailyGoal: z.object({ chapters: z.number(), quizzes: z.number() }),
  recentActivities: z.array(recentActivitySchema),
  totalXP: z.number(),
  totalQuizzes: z.number(),
  totalCorrect: z.number(),
  dailyHistory: z.array(dailyHistoryEntrySchema),
  scenarioProgress: z.record(z.string(), scenarioProgressSchema),
  spacedScenarioSchedules: z.record(z.string(), spacedScenarioScheduleSchema),
}).passthrough();

const wrongNoteSchema = z.object({
  questionId: z.string(),
  subject: z.string(),
  userAnswer: z.union([z.string(), z.number()]),
  attempts: z.number(),
  lastAttempt: z.number(),
  mastered: z.boolean(),
}).passthrough();

const quizResultSchema = z.object({
  questionId: z.string(),
  userAnswer: z.union([z.string(), z.number()]),
  isCorrect: z.boolean(),
  timestamp: z.number(),
  subject: z.string(),
  chapter: z.string(),
}).passthrough();

const diagnosticSessionSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(['ox', 'fill_in']),
  startedAt: z.number(),
  completedAt: z.number(),
  questionIds: z.array(z.string()),
  results: z.array(z.object({
    questionId: z.string(),
    isCorrect: z.boolean(),
  }).passthrough()),
  stats: z.object({ total: z.number(), correct: z.number(), rate: z.number() }),
}).passthrough();

const quizFeedbackSchema = z.object({
  questionId: z.string(),
  type: z.enum(['up', 'down']),
  timestamp: z.string(),
}).passthrough();

const quizErrorReportSchema = z.object({
  questionId: z.string(),
  message: z.string(),
  timestamp: z.string(),
}).passthrough();

export const quizStoreSchema = z.object({
  wrongNotes: z.array(wrongNoteSchema),
  quizHistory: z.array(quizResultSchema),
  diagnosticSessions: z.array(diagnosticSessionSchema),
  feedbacks: z.array(quizFeedbackSchema),
  errorReports: z.array(quizErrorReportSchema),
}).passthrough();

const leitnerCardSchema = z.object({
  id: z.string(),
  subjectSlug: z.string(),
  question: z.string(),
  answer: z.string(),
  box: z.number().int().min(1).max(5),
  lastReviewed: z.string(),
  nextReview: z.string(),
  createdAt: z.string(),
}).passthrough();

const reviewLogSchema = z.object({
  cardId: z.string(),
  grade: z.enum(['knew', 'hint', 'forgot']),
  fromBox: z.number(),
  toBox: z.number(),
  timestamp: z.number(),
}).passthrough();

export const leitnerStoreSchema = z.object({
  cards: z.array(leitnerCardSchema),
  reviewLogs: z.array(reviewLogSchema),
}).passthrough();

const bookmarkSchema = z.object({
  id: z.string(),
  path: z.string(),
  title: z.string(),
  subject: z.string(),
  createdAt: z.number(),
}).passthrough();

export const bookmarkStoreSchema = z.object({
  bookmarks: z.array(bookmarkSchema),
}).passthrough();

const weeklyMilestoneSchema = z.object({
  weekNumber: z.number(),
  subjects: z.array(z.string()),
  quizTarget: z.number(),
  chapterTarget: z.number(),
  label: z.string(),
}).passthrough();

const studyPlanSchema = z.object({
  createdAt: z.string(),
  examDate: z.string(),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  weakSubjects: z.array(z.string()),
  targetSubjects: z.array(z.string()),
  weeklyMilestones: z.array(weeklyMilestoneSchema),
  dailyQuizTarget: z.number(),
  dailyChapterTarget: z.number(),
  dailyQuestionsTarget: z.number(),
}).passthrough();

export const onboardingStoreSchema = z.object({
  isOnboarded: z.boolean(),
  examDate: z.string().nullable(),
  studyLevel: z.enum(['beginner', 'intermediate', 'advanced']).nullable(),
  weakSubjects: z.array(z.string()),
  targetSubjects: z.array(z.string()),
  dailyQuestionsTarget: z.number(),
  studyPlan: studyPlanSchema.nullable(),
}).passthrough();

const missionBlockSchema = z.object({
  id: z.string(),
  type: z.enum(['wrong-review', 'flashcard', 'quiz', 'term', 'concept']),
  label: z.string(),
  description: z.string(),
  count: z.number(),
  estimatedMinutes: z.number(),
  href: z.string(),
  completed: z.boolean(),
}).passthrough();

const dailyMissionSchema = z.object({
  date: z.string(),
  focusSubject: z.string().nullable(),
  blocks: z.array(missionBlockSchema),
}).passthrough();

export const focusStoreSchema = z.object({
  focusSubject: z.string().nullable(),
  focusSetAt: z.number().nullable(),
  focusExpiresAt: z.number().nullable(),
  focusMode: z.enum(['system', 'user', 'off']),
  todayMission: dailyMissionSchema.nullable(),
}).passthrough();

export const storeSchemas = {
  study: studyStoreSchema,
  quiz: quizStoreSchema,
  leitner: leitnerStoreSchema,
  bookmark: bookmarkStoreSchema,
  onboarding: onboardingStoreSchema,
  focus: focusStoreSchema,
} as const;

export type StoreSchemaKey = keyof typeof storeSchemas;
