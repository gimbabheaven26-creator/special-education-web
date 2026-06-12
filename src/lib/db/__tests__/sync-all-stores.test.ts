import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@/lib/supabase/browser', () => ({
  createClient: vi.fn(),
}));

import { createClient } from '@/lib/supabase/browser';
import { syncAllStores } from '../sync';
import { useQuizStore } from '@/stores/useQuizStore';
import { useFocusStore } from '@/stores/useFocusStore';
import { useStudyStore } from '@/stores/useStudyStore';

const mockedCreateClient = vi.mocked(createClient);

type KeyResult = { data: unknown; error: unknown } | Error;

/**
 * store_key별로 다른 응답을 주는 mock Supabase.
 * 결과가 Error 인스턴스면 maybeSingle이 reject → pullFromServer가 throw →
 * Promise.allSettled의 rejected 경로를 태운다.
 */
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

/** quizStoreSchema를 통과하는 최소 유효 데이터 (hydration 확인용 마커 포함) */
function validQuizData(marker: string) {
  return {
    wrongNotes: [
      {
        questionId: marker,
        subject: 'behavior',
        userAnswer: 'O',
        attempts: 1,
        lastAttempt: 1718000000000,
        mastered: false,
      },
    ],
    quizHistory: [],
    diagnosticSessions: [],
    feedbacks: [],
    errorReports: [],
  };
}

/** focusStoreSchema를 통과하는 최소 유효 데이터 */
function validFocusData(subject: string) {
  return {
    focusSubject: subject,
    focusSetAt: 1718000000000,
    focusExpiresAt: 1718086400000,
    focusMode: 'user',
    todayMission: null,
  };
}

describe('syncAllStores — 부분 실패 hydration (V 권고 회귀)', () => {
  let quizSnapshot: ReturnType<typeof useQuizStore.getState>;
  let focusSnapshot: ReturnType<typeof useFocusStore.getState>;
  let studySnapshot: ReturnType<typeof useStudyStore.getState>;

  beforeEach(() => {
    vi.restoreAllMocks();
    quizSnapshot = useQuizStore.getState();
    focusSnapshot = useFocusStore.getState();
    studySnapshot = useStudyStore.getState();
  });

  afterEach(() => {
    useQuizStore.setState(quizSnapshot, true);
    useFocusStore.setState(focusSnapshot, true);
    useStudyStore.setState(studySnapshot, true);
  });

  it('1개 스토어 pull이 reject되어도 throw 없이 나머지 스토어는 hydrate된다', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const sb = makePerKeySupabase({
      study: new Error('network down'),
      quiz: { data: { data: validQuizData('q-partial-1') }, error: null },
      focus: { data: { data: validFocusData('behavior') }, error: null },
      // leitner/bookmark/onboarding: 서버 데이터 없음(null) — setState 생략 경로
    });
    mockedCreateClient.mockReturnValue(sb as never);

    await expect(syncAllStores('user-1')).resolves.not.toThrow();

    // 실패한 study를 제외한 스토어는 서버 데이터로 hydrate
    expect(useQuizStore.getState().wrongNotes.some((n) => n.questionId === 'q-partial-1')).toBe(true);
    expect(useFocusStore.getState().focusSubject).toBe('behavior');
    // 실패한 스토어는 경고 로그만 남기고 기존 상태 유지
    expect(warnSpy).toHaveBeenCalledWith('[sync] pull study failed:', expect.any(Error));
    expect(useStudyStore.getState().currentStreak).toBe(studySnapshot.currentStreak);
  });

  it('Zod 검증 실패(손상 데이터) 스토어는 건너뛰고 유효한 스토어만 hydrate된다', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const sb = makePerKeySupabase({
      study: { data: { data: { currentStreak: 'corrupted-not-a-number' } }, error: null },
      quiz: { data: { data: validQuizData('q-zod-guard') }, error: null },
    });
    mockedCreateClient.mockReturnValue(sb as never);

    await expect(syncAllStores('user-1')).resolves.not.toThrow();

    // 손상된 study 데이터는 스토어에 반영되지 않음
    expect(useStudyStore.getState().currentStreak).toBe(studySnapshot.currentStreak);
    expect(warnSpy).toHaveBeenCalledWith('[sync] study data validation failed:', expect.anything());
    // 유효한 quiz 데이터는 정상 hydrate
    expect(useQuizStore.getState().wrongNotes.some((n) => n.questionId === 'q-zod-guard')).toBe(true);
  });
});
