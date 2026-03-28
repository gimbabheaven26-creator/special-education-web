// Re-export all domain modules for backward compatibility
// Existing `import { ... } from '@/lib/db'` paths continue to work.

export { getSubjects, getSubjectBySlug } from './subjects';

export {
  getQuizzesBySubject,
  getQuizzesByIds,
  getAllQuizzes,
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
