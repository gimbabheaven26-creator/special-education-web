// Quiz engine domain — scoring, difficulty, session management
// Re-exports for convenient barrel imports: `import { ... } from '@/lib/quiz'`

export {
  sortByAdaptiveDifficulty,
  getSubjectProficiency,
  getChapterProficiency,
  getProficiencyLabel,
} from './adaptive-difficulty';
export type { Proficiency } from './adaptive-difficulty';

export { checkFillInAnswer } from './answer-checker';

export { checkBlank } from './check-blank';

export {
  scoreDescriptiveAnswer,
  extractKeywords,
} from './descriptive-scoring';
export type { ScoringResult } from './descriptive-scoring';

export { seededRandom, seededSample, selectWithWrongPriority } from './seeded-sample';

export {
  saveSession,
  loadSession,
  clearSession,
} from './session-recovery';
export type { SavedSession } from './session-recovery';

export {
  convertQuizToCard,
  convertQuizBatch,
  filterFlashcardEligible,
} from './flashcard-converter';
export type { ConversionResult } from './flashcard-converter';
