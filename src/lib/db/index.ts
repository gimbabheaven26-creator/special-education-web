// Re-export all domain modules for backward compatibility
// Existing `import { ... } from '@/lib/db'` paths continue to work.

export { getSubjects, getSubjectBySlug } from './subjects';

export {
  getQuizzesBySubject,
  getQuizzesByIds,
  getAllQuizzes,
  getQuizzesForSearch,
  getQuizzesByType,
  getQuizzesByChapter,
  getQuizCount,
  searchQuizzes,
} from './quiz';

export {
  getWorksheetsBySubject,
  getWorksheetsByTopic,
  getWorksheetTopics,
  getAllWorksheetTopics,
  getWorksheetTopicById,
  getWorksheetQuestionCounts,
} from './worksheets';
export type { WorksheetQuestionRow, WorksheetTopicRow } from './worksheets';

export {
  getProfile,
  updateProfile,
  getUserData,
  upsertUserData,
  getAllUserData,
} from './user-data';
export type { Profile, StoreKey, UserDataRow } from './user-data';

// Community
export {
  getCommunityQuestions,
  getCommunityQuestionById,
  getUserVoteForQuestion,
  createCommunityQuestion,
  setVote,
} from './community-db';

// Reviews
export { getReviews, saveReview, deleteReview, updateAdminNote } from './review-db';
export type { ReviewRow } from './review-db';

// Profile (server-side auth)
export { getMyProfile, getMyProfileResult, upsertNickname, isAdmin, getRankingOptIn, updateRankingOptIn } from './profile';
export type { UserRole, UserProfile, ProfileLookupResult, ProfileMutationResult } from './profile';

// Analytics (client-side event logging)
export { logEvent, logQuizCompleted, logWrongNoteMastered, logDailyStreak } from './analytics';
export type { AnalyticsEvent } from './analytics';

// Sync (Zustand ↔ Supabase)
export {
  serializeState,
  pushStore,
  pullStore,
  pushToServer,
  pullFromServer,
  migrateGuestData,
  syncAllStores,
} from './sync';

// Admin auth
export { verifyAdmin, verifyAdminOrApiKey } from './admin-auth';

// Cached DB queries (unstable_cache — ISR at query level)
export {
  getCachedSubjects,
  getCachedSubjectBySlug,
  getCachedQuizzesBySubject,
  getCachedQuizzesByType,
  getCachedAllQuizzes,
  getCachedQuizzesForSearch,
  getCachedAllWorksheetTopics,
  getCachedWorksheetQuestionCounts,
} from './cache';
