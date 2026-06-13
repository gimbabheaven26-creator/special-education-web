import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/lib/supabase/browser', () => ({
  createClient: vi.fn(),
}));

import { createClient } from '@/lib/supabase/browser';
import {
  syncAllStores,
  pullFromServerWithMeta,
  setLocalModified,
  getLocalModified,
  clearLocalModified,
  migrateGuestData,
  STORE_LS_KEYS,
} from '../sync';
import { useQuizStore } from '@/stores/useQuizStore';
import { useFocusStore } from '@/stores/useFocusStore';

const mockedCreateClient = vi.mocked(createClient);

type KeyResult = { data: unknown; error: unknown } | Error;

/** store_key별로 data + updated_at을 반환하는 mock Supabase */
function makePerKeySupabase(resultsByKey: Record<string, KeyResult>) {
  return {
    from: vi.fn(() => {
      let capturedKey = '';
      const builder = {
        select: vi.fn(() => builder),
        eq: vi.fn((col: string, val: string) => {
          if (col === 'store_key') capturedKey = val;
          return builder;
        }),
        maybeSingle: vi.fn(() => {
          const r = resultsByKey[capturedKey];
          if (r instanceof Error) return Promise.reject(r);
          return Promise.resolve(r ?? { data: null, error: null });
        }),
      };
      return builder;
    }),
  };
}

function validQuizData(marker: string) {
  return {
    wrongNotes: [{
      questionId: marker, subject: 'behavior', userAnswer: 'O',
      attempts: 1, lastAttempt: 1718000000000, mastered: false,
    }],
    quizHistory: [], diagnosticSessions: [], feedbacks: [], errorReports: [],
  };
}

function validFocusData(subject: string) {
  return {
    focusSubject: subject, focusSetAt: 1718000000000, focusExpiresAt: 1718086400000,
    focusMode: 'user', todayMission: null,
  };
}

describe('로컬 수정 타임스탬프 헬퍼', () => {
  beforeEach(() => localStorage.clear());

  it('set → get 라운드트립', () => {
    setLocalModified('quiz', '2026-06-13T00:00:00Z');
    expect(getLocalModified('quiz')).toBe('2026-06-13T00:00:00Z');
  });

  it('set은 기본값으로 현재 ISO 시각을 기록', () => {
    setLocalModified('study');
    const ts = getLocalModified('study');
    expect(ts).not.toBeNull();
    expect(() => new Date(ts as string).toISOString()).not.toThrow();
  });

  it('clearLocalModified는 전체 키를 제거', () => {
    setLocalModified('quiz');
    setLocalModified('focus');
    clearLocalModified();
    expect(getLocalModified('quiz')).toBeNull();
    expect(getLocalModified('focus')).toBeNull();
  });
});

describe('pullFromServerWithMeta', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('data와 updated_at을 함께 반환', async () => {
    const sb = makePerKeySupabase({
      quiz: { data: { data: validQuizData('m'), updated_at: '2026-01-01T00:00:00Z' }, error: null },
    });
    mockedCreateClient.mockReturnValue(sb as never);
    const result = await pullFromServerWithMeta('user-1', 'quiz');
    expect(result?.updatedAt).toBe('2026-01-01T00:00:00Z');
    expect(result?.data).toMatchObject({ wrongNotes: expect.any(Array) });
  });
});

describe('syncAllStores — H1 pull stale-write 가드', () => {
  let quizSnapshot: ReturnType<typeof useQuizStore.getState>;
  let focusSnapshot: ReturnType<typeof useFocusStore.getState>;

  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    quizSnapshot = useQuizStore.getState();
    focusSnapshot = useFocusStore.getState();
  });

  afterEach(() => {
    useQuizStore.setState(quizSnapshot, true);
    useFocusStore.setState(focusSnapshot, true);
    localStorage.clear();
  });

  it('로컬이 서버보다 최신이면 hydration을 건너뛰고 keptLocal에 포함한다', async () => {
    // 로컬 quiz가 미래 시각 → 서버(과거)보다 최신
    setLocalModified('quiz', '2099-01-01T00:00:00Z');
    const sb = makePerKeySupabase({
      quiz: { data: { data: validQuizData('SERVER-should-not-overwrite'), updated_at: '2020-01-01T00:00:00Z' }, error: null },
      focus: { data: { data: validFocusData('behavior'), updated_at: '2026-01-01T00:00:00Z' }, error: null },
    });
    mockedCreateClient.mockReturnValue(sb as never);

    const { keptLocal } = await syncAllStores('user-1');

    // quiz는 로컬이 최신 → 서버 데이터로 덮어쓰지 않음
    expect(keptLocal).toContain('quiz');
    expect(useQuizStore.getState().wrongNotes.some((n) => n.questionId === 'SERVER-should-not-overwrite')).toBe(false);
    // focus는 로컬 타임스탬프 없음 → 서버 데이터로 hydrate
    expect(useFocusStore.getState().focusSubject).toBe('behavior');
    expect(keptLocal).not.toContain('focus');
  });

  it('로컬 타임스탬프가 없으면 서버 데이터로 hydrate하고 로컬 ts를 서버와 동기화', async () => {
    const sb = makePerKeySupabase({
      quiz: { data: { data: validQuizData('SERVER-win'), updated_at: '2026-05-05T00:00:00Z' }, error: null },
    });
    mockedCreateClient.mockReturnValue(sb as never);

    const { keptLocal } = await syncAllStores('user-1');

    expect(keptLocal).not.toContain('quiz');
    expect(useQuizStore.getState().wrongNotes.some((n) => n.questionId === 'SERVER-win')).toBe(true);
    expect(getLocalModified('quiz')).toBe('2026-05-05T00:00:00Z');
  });
});

describe('migrateGuestData — 기존 서버 데이터 보호', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('서버에 이미 데이터가 있으면 게스트 데이터로 덮어쓰지 않는다', async () => {
    localStorage.setItem(STORE_LS_KEYS.study, JSON.stringify({ state: { totalXP: 5 }, version: 1 }));

    const upsert = vi.fn().mockResolvedValue({ data: null, error: null });
    const builder = {
      select: vi.fn(() => builder),
      eq: vi.fn(() => builder),
      // 서버에 study 데이터가 이미 존재
      maybeSingle: vi.fn().mockResolvedValue({ data: { data: { totalXP: 999 } }, error: null }),
      upsert,
    };
    mockedCreateClient.mockReturnValue({ from: vi.fn(() => builder) } as never);

    await migrateGuestData('user-1');
    expect(upsert).not.toHaveBeenCalled();
  });

  it('서버에 데이터가 없으면 게스트 데이터를 push한다', async () => {
    localStorage.setItem(STORE_LS_KEYS.study, JSON.stringify({ state: { totalXP: 5 }, version: 1 }));

    const upsert = vi.fn().mockResolvedValue({ data: null, error: null });
    const builder = {
      select: vi.fn(() => builder),
      eq: vi.fn(() => builder),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      upsert,
    };
    mockedCreateClient.mockReturnValue({ from: vi.fn(() => builder) } as never);

    await migrateGuestData('user-1');
    expect(upsert).toHaveBeenCalled();
  });
});
