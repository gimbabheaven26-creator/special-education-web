// ─── Types (migrated from @/data/worksheets/types) ───

export interface WorksheetQuestion {
  id: string;
  topicId: string;
  subject: string;
  type: 'fill_in' | 'descriptive';
  difficulty: 1 | 2 | 3;
  question: string;
  answer: string;
  explanation: string;
  source?: string;
  tags?: string[];
}

export interface WorksheetConfig {
  id: string;
  subject: string;
  topicId: string;
  topicName: string;
  type: 'fill_in' | 'descriptive' | 'mixed';
  questionCount: number;
  questions: WorksheetQuestion[];
  createdAt: string;
}

/** 과목별 코드 매핑 (학습지 ID 생성용) */
const SUBJECT_CODES: Record<string, string> = {
  'behavior-support': 'BH',
  'introduction': 'IN',
  'laws': 'LW',
  'curriculum': 'CR',
  'assessment': 'AS',
  'inclusive-education': 'IE',
  'transition': 'TR',
};

/**
 * Generate a unique worksheet ID like SP-BH-0042
 */
export function generateWorksheetId(subjectSlug: string): string {
  const code = SUBJECT_CODES[subjectSlug] ?? 'XX';
  const num = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
  return `SP-${code}-${num}`;
}

/**
 * Save worksheet to localStorage for cross-page access (QR 코드 스캔 시에도 접근 가능)
 */
export function saveWorksheet(worksheet: WorksheetConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`worksheet-${worksheet.id}`, JSON.stringify(worksheet));
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
