import type { WorksheetConfig } from '@/data/worksheets/types';
import { SUBJECT_CODES } from '@/data/worksheets/types';
import { getWorksheetQuestions as getQuestionsFromBank } from '@/data/worksheets';

/**
 * Generate a unique worksheet ID like SP-BH-0042
 */
export function generateWorksheetId(subjectSlug: string): string {
  const code = SUBJECT_CODES[subjectSlug] ?? 'XX';
  const num = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
  return `SP-${code}-${num}`;
}

/**
 * Fisher-Yates shuffle
 */
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Build a WorksheetConfig from selections
 */
export function buildWorksheet(
  subjectSlug: string,
  topicId: string,
  topicName: string,
  type: 'fill_in' | 'descriptive' | 'mixed',
): WorksheetConfig | null {
  const questionCount = type === 'fill_in' ? 8 : type === 'descriptive' ? 4 : 6;

  let allQuestions = getQuestionsFromBank(subjectSlug, topicId);

  // Filter by type if not mixed
  if (type !== 'mixed') {
    allQuestions = allQuestions.filter((q) => q.type === type);
  }

  // No questions available
  if (allQuestions.length === 0) {
    return null;
  }

  // Shuffle and pick
  const picked = shuffleArray(allQuestions).slice(0, questionCount);

  return {
    id: generateWorksheetId(subjectSlug),
    subject: subjectSlug,
    topicId,
    topicName,
    type,
    questionCount: picked.length,
    questions: picked,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Save worksheet to localStorage for cross-page access (QR 코드 스캔 시에도 접근 가능)
 */
export function saveWorksheet(worksheet: WorksheetConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`worksheet-${worksheet.id}`, JSON.stringify(worksheet));
    // 오래된 학습지 정리 (최근 20개만 유지)
    cleanupOldWorksheets();
  } catch {
    // Storage full or unavailable
  }
}

/**
 * Load worksheet from localStorage
 */
export function loadWorksheet(id: string): WorksheetConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(`worksheet-${id}`);
    if (stored) return JSON.parse(stored);
  } catch {
    // Parse error
  }
  return null;
}

/**
 * 오래된 학습지 정리 (최근 20개만 유지)
 */
function cleanupOldWorksheets(): void {
  try {
    const worksheetKeys: { key: string; createdAt: string }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('worksheet-')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          worksheetKeys.push({ key, createdAt: parsed.createdAt || '' });
        }
      }
    }
    if (worksheetKeys.length > 20) {
      worksheetKeys.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      worksheetKeys.slice(20).forEach(({ key }) => localStorage.removeItem(key));
    }
  } catch {
    // ignore cleanup errors
  }
}
