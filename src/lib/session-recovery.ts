/**
 * Quiz Session Recovery — localStorage 기반 세션 자동 저장/복원
 *
 * 모바일에서 실수로 뒤로가기, 탭 닫기 등에 대비하여
 * 진행 상황을 자동 저장하고 재방문 시 복원한다.
 * 24시간 만료.
 */

const STORAGE_KEY = 'se-quiz-session';
const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24시간

export interface SavedSession {
  subjectSlug: string;
  questionIds: string[];
  answers: Array<{
    questionIndex: number;
    isCorrect: boolean;
    userAnswer: string | number;
  }>;
  skippedIndices: number[];
  currentIndex: number;
  xpEarned: number;
  preset: string;
  questionCount: number;
  savedAt: number;
}

export function saveSession(session: Omit<SavedSession, 'savedAt'>): void {
  if (typeof window === 'undefined') return;
  try {
    const data: SavedSession = { ...session, savedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable
  }
}

export function loadSession(subjectSlug: string): SavedSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data: SavedSession = JSON.parse(raw);

    // 다른 과목이면 무시
    if (data.subjectSlug !== subjectSlug) return null;

    // 만료 확인
    if (Date.now() - data.savedAt > EXPIRY_MS) {
      clearSession();
      return null;
    }

    // 이미 완료된 세션이면 무시
    const answeredCount = data.answers.length;
    const totalCount = data.questionIds.length;
    if (answeredCount >= totalCount) {
      clearSession();
      return null;
    }

    return data;
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
