/**
 * Supabase user_data 동기화 유틸 (v2)
 * 인증 사용자의 Zustand 스토어 상태를 서버에 UPSERT/SELECT
 */

import { createClient } from '@/lib/supabase/browser';

export type StoreKey = 'study' | 'leitner' | 'quiz' | 'bookmark' | 'onboarding';

/** 함수 제거, 직렬화 가능한 데이터만 추출 */
export function serializeState(state: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(state).filter(([, v]) => typeof v !== 'function'),
  );
}

// ─── Legacy API (keep for backward compat) ───────────────────────────────────

/** 스토어 데이터를 서버에 UPSERT (비로그인 시 no-op) */
export async function pushStore(key: StoreKey, data: Record<string, unknown>): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await pushToServer(user.id, key, data);
}

/** 서버에서 스토어 데이터 조회 (없으면 null) */
export async function pullStore(
  key: StoreKey,
): Promise<{ data: Record<string, unknown>; updatedAt: string } | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const result = await pullFromServer(user.id, key);
  if (!result) return null;
  // re-fetch updated_at from server
  const { data } = await supabase
    .from('user_data')
    .select('updated_at')
    .eq('user_id', user.id)
    .eq('store_key', key)
    .maybeSingle();
  return { data: result, updatedAt: (data as Record<string, string> | null)?.updated_at ?? new Date().toISOString() };
}

// ─── v2 API ──────────────────────────────────────────────────────────────────

/**
 * 특정 스토어 데이터를 userId 기준으로 서버에 UPSERT.
 * localUpdatedAt을 제공하면 서버의 updated_at과 비교하여 서버가 더 최신이면 덮어쓰기를 건너뛴다.
 * user_data.store_key 체크 제약이 'onboarding'을 포함하지 않으면 gracefully 실패.
 */
/**
 * 특정 스토어 데이터를 userId 기준으로 서버에 UPSERT.
 * localUpdatedAt을 제공하면 서버의 updated_at과 비교하여 서버가 더 최신이면 덮어쓰기를 건너뛴다.
 * user_data.store_key 체크 제약이 'onboarding'을 포함하지 않으면 gracefully 실패.
 *
 * @returns 'pushed' — 서버에 기록됨
 * @returns 'skipped' — 서버가 더 최신이라 건너뜀
 * @returns 'error' — 서버 오류
 */
export async function pushToServer(
  userId: string,
  key: StoreKey,
  data: Record<string, unknown>,
  localUpdatedAt?: string,
): Promise<'pushed' | 'skipped' | 'error'> {
  const supabase = createClient();

  // 로컬 타임스탬프가 있으면 서버와 비교하여 stale write 방지
  if (localUpdatedAt) {
    const { data: existing } = await supabase
      .from('user_data')
      .select('updated_at')
      .eq('user_id', userId)
      .eq('store_key', key)
      .maybeSingle();
    if (existing) {
      const serverTs = (existing as { updated_at: string }).updated_at;
      if (serverTs > localUpdatedAt) {
        // 서버 데이터가 더 최신 — 오래된 로컬 데이터로 덮어쓰기 건너뜀
        return 'skipped';
      }
    }
  }

  const { error } = await supabase.from('user_data').upsert(
    { user_id: userId, store_key: key, data, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,store_key' },
  );
  if (error) {
    // 23514 = check constraint violation (store_key enum not yet expanded)
    if (error.code !== '23514') {
      console.error(`[sync] push ${key} failed:`, error.message);
    }
    return 'error';
  }
  return 'pushed';
}

/**
 * 특정 스토어 데이터를 서버에서 조회.
 */
export async function pullFromServer(
  userId: string,
  key: StoreKey,
): Promise<Record<string, unknown> | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_data')
    .select('data')
    .eq('user_id', userId)
    .eq('store_key', key)
    .maybeSingle();

  if (error) {
    console.error(`[sync] pull ${key} failed:`, error.message);
    return null;
  }
  if (!data) return null;
  return (data as { data: Record<string, unknown> }).data;
}

/**
 * 게스트 → 로그인 마이그레이션.
 * localStorage에 남아있는 5개 스토어 데이터를 서버에 일괄 push.
 */
export async function migrateGuestData(userId: string): Promise<void> {
  const STORE_LS_KEYS: Record<StoreKey, string> = {
    study: 'special-edu-study-store',
    leitner: 'special-edu-leitner',
    quiz: 'special-edu-quiz-store',
    bookmark: 'special-edu-bookmarks',
    onboarding: 'special-edu-onboarding',
  };

  const promises: Promise<void>[] = [];
  for (const [key, lsKey] of Object.entries(STORE_LS_KEYS) as [StoreKey, string][]) {
    try {
      const raw = localStorage.getItem(lsKey);
      if (!raw) continue;
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') continue;
      // Zustand persist wraps state in { state: {...}, version: N }
      const state = (parsed as Record<string, unknown>).state;
      if (!state || typeof state !== 'object') continue;
      promises.push(pushToServer(userId, key, serializeState(state as Record<string, unknown>)));
    } catch {
      // localStorage read/parse failure — skip
    }
  }
  await Promise.all(promises);
}

/**
 * 서버에서 5개 스토어 데이터를 pull 하여 각 Zustand 스토어에 hydrate.
 * 이 함수는 클라이언트에서만 호출 가능.
 */
export async function syncAllStores(userId: string): Promise<void> {
  // Dynamic imports to avoid circular deps / SSR issues
  const [
    { useStudyStore },
    { useQuizStore },
    { useLeitnerStore },
    { useBookmarkStore },
    { useOnboardingStore },
  ] = await Promise.all([
    import('@/stores/useStudyStore'),
    import('@/stores/useQuizStore'),
    import('@/stores/useLeitnerStore'),
    import('@/stores/useBookmarkStore'),
    import('@/stores/useOnboardingStore'),
  ]);

  const keys: StoreKey[] = ['study', 'quiz', 'leitner', 'bookmark', 'onboarding'];
  const results = await Promise.all(keys.map((k) => pullFromServer(userId, k)));

  const [studyData, quizData, leitnerData, bookmarkData, onboardingData] = results;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (studyData) useStudyStore.setState(studyData as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (quizData) useQuizStore.setState(quizData as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (leitnerData) useLeitnerStore.setState(leitnerData as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (bookmarkData) useBookmarkStore.setState(bookmarkData as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (onboardingData) useOnboardingStore.setState(onboardingData as any);
}
