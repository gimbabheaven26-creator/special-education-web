// Content domain — concepts, MDX, worksheets, structure
// Re-exports: `import { ... } from '@/lib/content'`

export {
  getAllSubjects,
  getSubjectFiles,
  getConceptsForSubject,
  SLUG_TO_CONCEPTS_FOLDER,
  CONCEPTS_FOLDER_TO_SLUG,
  getConceptUrl,
} from './concepts';

export { getConceptUrl as getConceptUrlDirect } from './concept-urls';
export { SLUG_TO_CONCEPTS_FOLDER as CONCEPTS_MAP } from './concept-urls';

export {
  generateWorksheetId,
  saveWorksheet,
  loadWorksheet,
} from './worksheet-utils';
export type { WorksheetConfig, WorksheetQuestion } from './worksheet-utils';

export { getKiceCounts } from './structure-utils';
